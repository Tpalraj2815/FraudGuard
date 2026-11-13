
# ==========================================
# FRAUDGUARD - ADMIN AUTHENTICATION
# ==========================================

import os
import sqlite3
import hashlib
import hmac
import secrets
from pathlib import Path
from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify


# ==========================================
# BLUEPRINT
# ==========================================

auth_bp = Blueprint("auth", __name__)


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATABASE_PATH = PROJECT_ROOT / "database" / "fraudguard.db"

DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_db_connection():

    connection = sqlite3.connect(DATABASE_PATH)

    connection.row_factory = sqlite3.Row

    return connection


# ==========================================
# PASSWORD HASHING
# ==========================================

def hash_password(password):

    salt = secrets.token_bytes(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        310000
    )

    return salt.hex() + ":" + password_hash.hex()


def verify_password(password, stored_hash):

    try:

        salt_hex, hash_hex = stored_hash.split(":")

        salt = bytes.fromhex(salt_hex)

        expected_hash = bytes.fromhex(hash_hex)

        actual_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            310000
        )

        return hmac.compare_digest(
            actual_hash,
            expected_hash
        )

    except (ValueError, TypeError):

        return False


# ==========================================
# CREATE AUTHENTICATION TABLES
# ==========================================

def initialize_auth_database():

    connection = get_db_connection()

    cursor = connection.cursor()

    # Admin accounts
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT UNIQUE NOT NULL,

            email TEXT UNIQUE NOT NULL,

            password_hash TEXT NOT NULL,

            role TEXT DEFAULT 'admin',

            created_at TEXT DEFAULT CURRENT_TIMESTAMP

        )
    """)

    # Login sessions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_sessions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            admin_id INTEGER NOT NULL,

            token_hash TEXT UNIQUE NOT NULL,

            expires_at TEXT NOT NULL,

            created_at TEXT DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (admin_id)
                REFERENCES admin_users(id)

        )
    """)

    connection.commit()

    # Create first administrator if one does not exist
    cursor.execute("""
        SELECT id
        FROM admin_users
        WHERE email = ?
    """, ("admin@fraudguard.com",))

    existing_admin = cursor.fetchone()

    if existing_admin is None:

        initial_password = os.environ.get(
            "FRAUDGUARD_ADMIN_PASSWORD",
            "Admin@12345"
        )

        cursor.execute("""
            INSERT INTO admin_users
            (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        """, (
            "admin",
            "admin@fraudguard.com",
            hash_password(initial_password),
            "admin"
        ))

        connection.commit()

        print("--------------------------------------")
        print("FraudGuard Admin Account Created")
        print("Username: admin@fraudguard.com")
        print("Password: Use FRAUDGUARD_ADMIN_PASSWORD")
        print("Or the initial development password")
        print("--------------------------------------")

    connection.close()


# Initialize database when this module loads
initialize_auth_database()


# ==========================================
# ADMIN LOGIN API
# POST /api/login
# ==========================================

@auth_bp.route("/api/login", methods=["POST"])
def admin_login():

    data = request.get_json(silent=True) or {}

    username = str(
        data.get("username") or data.get("email") or ""
    ).strip().lower()

    password = str(data.get("password") or "")

    if not username or not password:

        return jsonify({
            "success": False,
            "message": "Please enter your username and password."
        }), 400

    connection = get_db_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM admin_users
        WHERE LOWER(username) = ?
           OR LOWER(email) = ?
        LIMIT 1
    """, (username, username))

    admin = cursor.fetchone()

    if admin is None:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Invalid username or password."
        }), 401

    if not verify_password(
        password,
        admin["password_hash"]
    ):

        connection.close()

        return jsonify({
            "success": False,
            "message": "Invalid username or password."
        }), 401

    # Generate a secure login token
    token = secrets.token_urlsafe(48)

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    expires_at = (
        datetime.now(timezone.utc) + timedelta(hours=8)
    ).isoformat()

    cursor.execute("""
        INSERT INTO admin_sessions
        (admin_id, token_hash, expires_at)
        VALUES (?, ?, ?)
    """, (
        admin["id"],
        token_hash,
        expires_at
    ))

    connection.commit()

    connection.close()

    return jsonify({

        "success": True,

        "message": "Admin login successful.",

        "token": token,

        "user": {
            "id": admin["id"],
            "username": admin["username"],
            "email": admin["email"],
            "role": admin["role"]
        }

    }), 200


# ==========================================
# VERIFY ADMIN TOKEN
# ==========================================

def verify_admin_token(token):

    if not token:
        return None

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    connection = get_db_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            admin_users.id,
            admin_users.username,
            admin_users.email,
            admin_users.role
        FROM admin_sessions
        JOIN admin_users
            ON admin_sessions.admin_id = admin_users.id
        WHERE admin_sessions.token_hash = ?
          AND admin_sessions.expires_at > ?
    """, (
        token_hash,
        datetime.now(timezone.utc).isoformat()
    ))

    admin = cursor.fetchone()

    connection.close()

    if admin is None:
        return None

    return dict(admin)


# ==========================================
# ADMIN LOGOUT API
# POST /api/logout
# ==========================================

@auth_bp.route("/api/logout", methods=["POST"])
def admin_logout():

    auth_header = request.headers.get(
        "Authorization", ""
    )

    token = (
        auth_header[7:]
        if auth_header.startswith("Bearer ")
        else ""
    )

    if not token:

        return jsonify({
            "success": False,
            "message": "Authentication token is missing."
        }), 401

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    connection = get_db_connection()

    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM admin_sessions
        WHERE token_hash = ?
    """, (token_hash,))

    connection.commit()

    connection.close()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    }), 200


# ==========================================
# ADMIN ACCOUNT INFORMATION API
# GET /api/admin/me
# ==========================================

@auth_bp.route("/api/admin/me", methods=["GET"])
def admin_profile():

    auth_header = request.headers.get(
        "Authorization", ""
    )

    token = (
        auth_header[7:]
        if auth_header.startswith("Bearer ")
        else ""
    )

    admin = verify_admin_token(token)

    if admin is None:

        return jsonify({
            "success": False,
            "message": "Please log in as administrator."
        }), 401

    return jsonify({
        "success": True,
        "admin": admin
    }), 200
