"""
SQLite database for user management and credits system.
Replaces Firebase Firestore with a local database.
"""
import sqlite3
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any, List
import threading
import random
import string

# Thread-local storage for database connections
_thread_local = threading.local()

# Database file path
DB_PATH = Path(__file__).parent / "users.db"

# Admin email
ADMIN_EMAIL = "ayushnema2468@gmail.com"

def get_db():
    """Get a thread-local database connection."""
    if not hasattr(_thread_local, 'connection'):
        _thread_local.connection = sqlite3.connect(
            str(DB_PATH), 
            check_same_thread=False,
            timeout=30.0,  # Wait up to 30 seconds if database is locked
            isolation_level=None  # Autocommit mode
        )
        _thread_local.connection.row_factory = sqlite3.Row
    return _thread_local.connection

def is_admin(email: str) -> bool:
    """Check if an email is the admin email."""
    return email.lower() == ADMIN_EMAIL.lower()

def init_db():
    """Initialize the database with required tables."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            uid TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            credits INTEGER DEFAULT 6,
            is_premium BOOLEAN DEFAULT 0,
            premium_expires_at TEXT,
            subscription_type TEXT,
            payment_id TEXT,
            is_admin BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    
    # Create predictions history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT NOT NULL,
            stock TEXT NOT NULL,
            days INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (uid) REFERENCES users (uid)
        )
    """)
    
    # Create coupons table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            credits INTEGER NOT NULL,
            premium_days INTEGER DEFAULT 0,
            max_uses INTEGER DEFAULT 1,
            uses INTEGER DEFAULT 0,
            active BOOLEAN DEFAULT 1,
            created_at TEXT NOT NULL,
            expires_at TEXT,
            created_by TEXT NOT NULL
        )
    """)
    
    # Create coupon redemptions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coupon_redemptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coupon_id INTEGER NOT NULL,
            uid TEXT NOT NULL,
            redeemed_at TEXT NOT NULL,
            FOREIGN KEY (coupon_id) REFERENCES coupons (id),
            FOREIGN KEY (uid) REFERENCES users (uid)
        )
    """)
    
    conn.commit()
    print(f"✅ Database initialized at {DB_PATH}")

def create_user(uid: str, email: str, credits: int = 6) -> Dict[str, Any]:
    """Create a new user in the database."""
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    admin = is_admin(email)
    
    try:
        cursor.execute("""
            INSERT INTO users (uid, email, credits, is_premium, is_admin, created_at, updated_at)
            VALUES (?, ?, ?, 0, ?, ?, ?)
        """, (uid, email, credits, 1 if admin else 0, now, now))
        conn.commit()
        
        print(f"✅ User created: {email} (UID: {uid})")
        
        return {
            "uid": uid,
            "email": email,
            "credits": credits,
            "isPremium": False,
            "isAdmin": admin,
            "createdAt": now
        }
    except sqlite3.IntegrityError as e:
        print(f"⚠️ User already exists: {uid}, fetching existing data")
        # User already exists, return existing data
        return get_user(uid)

def get_user(uid: str) -> Optional[Dict[str, Any]]:
    """Get user data by UID."""
    conn = get_db()
    cursor = conn.cursor()
    
    print(f"🔎 Querying database for UID: {uid}")
    cursor.execute("SELECT * FROM users WHERE uid = ?", (uid,))
    row = cursor.fetchone()
    
    if row:
        print(f"✅ Found user in database: {row['email']}")
        # Check if premium has expired
        is_premium = bool(row["is_premium"])
        premium_expires_at = row["premium_expires_at"]
        
        if is_premium and premium_expires_at:
            expiration = datetime.fromisoformat(premium_expires_at)
            if expiration < datetime.utcnow():
                # Premium expired, update status
                cursor.execute("""
                    UPDATE users 
                    SET is_premium = 0, updated_at = ?
                    WHERE uid = ?
                """, (datetime.utcnow().isoformat(), uid))
                conn.commit()
                is_premium = False
        
        return {
            "uid": row["uid"],
            "email": row["email"],
            "credits": row["credits"],
            "isPremium": is_premium,
            "premiumExpiresAt": premium_expires_at,
            "subscriptionType": row["subscription_type"],
            "paymentId": row["payment_id"],
            "isAdmin": bool(row["is_admin"]),
            "createdAt": row["created_at"]
        }
    return None

def update_credits(uid: str, delta: int) -> bool:
    """Update user credits by delta (positive or negative)."""
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    try:
        cursor.execute("""
            UPDATE users 
            SET credits = credits + ?, updated_at = ?
            WHERE uid = ?
        """, (delta, now, uid))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error updating credits: {e}")
        return False

def use_credit(uid: str) -> bool:
    """Decrement user credits by 3. Returns True if successful."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if user has credits or is premium
    user = get_user(uid)
    if not user:
        return False
    
    if user["isPremium"]:
        return True  # Premium users have unlimited predictions
    
    if user["credits"] < 3:
        return False  # Not enough credits
    
    # Decrement credits by 3
    return update_credits(uid, -3)

def set_premium(uid: str, is_premium: bool, premium_days: int = 0, subscription_type: str = None, payment_id: str = None) -> bool:
    """Set user premium status with expiration date."""
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.utcnow()
    premium_expires_at = None
    
    if is_premium and premium_days > 0:
        # Calculate expiration date
        premium_expires_at = (now + timedelta(days=premium_days)).isoformat()
    
    try:
        cursor.execute("""
            UPDATE users 
            SET is_premium = ?, 
                premium_expires_at = ?,
                subscription_type = ?,
                payment_id = ?,
                updated_at = ?
            WHERE uid = ?
        """, (1 if is_premium else 0, premium_expires_at, subscription_type, payment_id, now.isoformat(), uid))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error setting premium status: {e}")
        return False

def add_prediction_history(uid: str, stock: str, days: int) -> bool:
    """Record a prediction in history."""
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    try:
        cursor.execute("""
            INSERT INTO predictions (uid, stock, days, created_at)
            VALUES (?, ?, ?, ?)
        """, (uid, stock, days, now))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error adding prediction history: {e}")
        return False

# Admin functions for coupon management

def generate_coupon_code(length: int = 8) -> str:
    """Generate a random coupon code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def create_coupon(credits: int, premium_days: int = 0, max_uses: int = 1, 
                 expires_at: Optional[str] = None, created_by: str = "", 
                 code: Optional[str] = None) -> Dict[str, Any]:
    """Create a new coupon (admin only)."""
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    coupon_code = code or generate_coupon_code()
    
    try:
        cursor.execute("""
            INSERT INTO coupons (code, credits, premium_days, max_uses, uses, active, created_at, expires_at, created_by)
            VALUES (?, ?, ?, ?, 0, 1, ?, ?, ?)
        """, (coupon_code, credits, premium_days, max_uses, now, expires_at, created_by))
        conn.commit()
        
        return {
            "id": cursor.lastrowid,
            "code": coupon_code,
            "credits": credits,
            "premiumDays": premium_days,
            "maxUses": max_uses,
            "uses": 0,
            "active": True,
            "createdAt": now,
            "expiresAt": expires_at,
            "createdBy": created_by
        }
    except sqlite3.IntegrityError:
        return {"error": "Coupon code already exists"}
    except Exception as e:
        return {"error": str(e)}

def redeem_coupon(uid: str, code: str) -> Dict[str, Any]:
    """Redeem a coupon for a user."""
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    # Get coupon
    cursor.execute("SELECT * FROM coupons WHERE code = ? AND active = 1", (code,))
    coupon = cursor.fetchone()
    
    if not coupon:
        return {"success": False, "error": "Invalid or inactive coupon"}
    
    # Check expiration
    if coupon["expires_at"] and coupon["expires_at"] < now:
        return {"success": False, "error": "Coupon has expired"}
    
    # Check max uses
    if coupon["uses"] >= coupon["max_uses"]:
        return {"success": False, "error": "Coupon has reached maximum uses"}
    
    # Check if user already redeemed
    cursor.execute("SELECT * FROM coupon_redemptions WHERE coupon_id = ? AND uid = ?", 
                  (coupon["id"], uid))
    if cursor.fetchone():
        return {"success": False, "error": "You have already redeemed this coupon"}
    
    try:
        # Add credits
        update_credits(uid, coupon["credits"])
        
        # Add premium if applicable
        if coupon["premium_days"] > 0:
            set_premium(uid, True)
        
        # Record redemption
        cursor.execute("""
            INSERT INTO coupon_redemptions (coupon_id, uid, redeemed_at)
            VALUES (?, ?, ?)
        """, (coupon["id"], uid, now))
        
        # Increment uses
        cursor.execute("""
            UPDATE coupons SET uses = uses + 1 WHERE id = ?
        """, (coupon["id"],))
        
        conn.commit()
        
        return {
            "success": True,
            "credits": coupon["credits"],
            "premiumDays": coupon["premium_days"]
        }
    except Exception as e:
        conn.rollback()
        return {"success": False, "error": str(e)}

def get_all_coupons() -> List[Dict[str, Any]]:
    """Get all coupons (admin only)."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM coupons ORDER BY created_at DESC")
    rows = cursor.fetchall()
    
    return [{
        "id": row["id"],
        "code": row["code"],
        "credits": row["credits"],
        "premiumDays": row["premium_days"],
        "maxUses": row["max_uses"],
        "uses": row["uses"],
        "active": bool(row["active"]),
        "createdAt": row["created_at"],
        "expiresAt": row["expires_at"],
        "createdBy": row["created_by"]
    } for row in rows]

def delete_coupon(coupon_id: int) -> bool:
    """Delete a coupon (admin only)."""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM coupons WHERE id = ?", (coupon_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error deleting coupon: {e}")
        return False

def get_all_users() -> List[Dict[str, Any]]:
    """Get all users (admin only)."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
    rows = cursor.fetchall()
    
    return [{
        "uid": row["uid"],
        "email": row["email"],
        "credits": row["credits"],
        "isPremium": bool(row["is_premium"]),
        "isAdmin": bool(row["is_admin"]),
        "createdAt": row["created_at"]
    } for row in rows]

def get_stats() -> Dict[str, Any]:
    """Get platform statistics (admin only)."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM users")
    total_users = cursor.fetchone()["total"]
    
    cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_premium = 1")
    premium_users = cursor.fetchone()["total"]
    
    cursor.execute("SELECT COUNT(*) as total FROM predictions")
    total_predictions = cursor.fetchone()["total"]
    
    cursor.execute("SELECT COUNT(*) as total FROM coupons WHERE active = 1")
    active_coupons = cursor.fetchone()["total"]
    
    return {
        "totalUsers": total_users,
        "premiumUsers": premium_users,
        "totalPredictions": total_predictions,
        "activeCoupons": active_coupons
    }

# Initialize database on module import
init_db()
