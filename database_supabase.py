"""
Supabase database module for user management and credits system.
Replaces SQLite with Supabase PostgreSQL database.
"""
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
import random
import string

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # Use service key for backend

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Admin email
ADMIN_EMAIL = "ayushnema2468@gmail.com"

def is_admin(email: str) -> bool:
    """Check if email belongs to admin."""
    return email.lower() == ADMIN_EMAIL.lower()

def create_user(uid: str, email: str, credits: int = 6) -> Dict[str, Any]:
    """Create a new user in the database."""
    try:
        admin = is_admin(email)
        now = datetime.utcnow().isoformat()
        
        data = {
            "uid": uid,
            "email": email,
            "credits": credits,
            "is_premium": False,
            "is_admin": admin,
            "created_at": now,
            "updated_at": now
        }
        
        result = supabase.table("users").insert(data).execute()
        
        if result.data:
            user = result.data[0]
            return {
                "uid": user["uid"],
                "email": user["email"],
                "credits": user["credits"],
                "isPremium": user["is_premium"],
                "isAdmin": user["is_admin"],
                "createdAt": user["created_at"]
            }
    except Exception as e:
        print(f"Error creating user: {e}")
        # If user exists, return existing data
        return get_user(uid)

def get_user(uid: str) -> Optional[Dict[str, Any]]:
    """Get user data by UID."""
    try:
        result = supabase.table("users").select("*").eq("uid", uid).execute()
        
        if result.data and len(result.data) > 0:
            user = result.data[0]
            
            # Check if premium has expired
            is_premium = user["is_premium"]
            premium_expires_at = user.get("premium_expires_at")
            
            if is_premium and premium_expires_at:
                from datetime import timezone
                expiration = datetime.fromisoformat(premium_expires_at.replace('Z', '+00:00'))
                now_utc = datetime.now(timezone.utc)
                if expiration < now_utc:
                    # Premium expired, update status
                    supabase.table("users").update({
                        "is_premium": False,
                        "updated_at": now_utc.isoformat()
                    }).eq("uid", uid).execute()
                    is_premium = False
            
            return {
                "uid": user["uid"],
                "email": user["email"],
                "credits": user["credits"],
                "isPremium": is_premium,
                "premiumExpiresAt": premium_expires_at,
                "subscriptionType": user.get("subscription_type"),
                "paymentId": user.get("payment_id"),
                "isAdmin": user["is_admin"],
                "createdAt": user["created_at"]
            }
        return None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

def update_credits(uid: str, delta: int) -> bool:
    """Update user credits by delta (positive or negative)."""
    try:
        # Get current credits
        user = get_user(uid)
        if not user:
            return False
        
        new_credits = user["credits"] + delta
        
        result = supabase.table("users").update({
            "credits": new_credits,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("uid", uid).execute()
        
        return len(result.data) > 0
    except Exception as e:
        print(f"Error updating credits: {e}")
        return False

def use_credit(uid: str) -> bool:
    """Decrement user credits by 3. Returns True if successful."""
    user = get_user(uid)
    if not user:
        return False
    
    if user["isPremium"]:
        return True  # Premium users have unlimited predictions
    
    if user["credits"] < 3:
        return False  # Not enough credits
    
    # Decrement 3 credits
    return update_credits(uid, -3)

def set_premium(uid: str, is_premium: bool, premium_days: int = 0, 
                subscription_type: str = None, payment_id: str = None) -> bool:
    """Set user premium status with expiration date."""
    try:
        premium_expires_at = None
        
        if is_premium and premium_days > 0:
            # Calculate expiration date
            expiration = datetime.utcnow() + timedelta(days=premium_days)
            premium_expires_at = expiration.isoformat()
        
        result = supabase.table("users").update({
            "is_premium": is_premium,
            "premium_expires_at": premium_expires_at,
            "subscription_type": subscription_type,
            "payment_id": payment_id,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("uid", uid).execute()
        
        return len(result.data) > 0
    except Exception as e:
        print(f"Error setting premium status: {e}")
        return False

def add_prediction_history(uid: str, stock: str, days: int) -> bool:
    """Record a prediction in history."""
    try:
        data = {
            "uid": uid,
            "stock": stock,
            "days": days,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("predictions").insert(data).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error adding prediction history: {e}")
        return False

def generate_coupon_code(length: int = 8) -> str:
    """Generate a random coupon code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def create_coupon(credits: int = 0, premium_days: int = 0, max_uses: int = 1,
                 expires_at: str = None, created_by: str = "", code: str = None) -> Dict[str, Any]:
    """Create a new coupon code."""
    try:
        if not code:
            code = generate_coupon_code()
        
        data = {
            "code": code,
            "credits": credits,
            "premium_days": premium_days,
            "max_uses": max_uses,
            "uses": 0,
            "active": True,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at,
            "created_by": created_by
        }
        
        result = supabase.table("coupons").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {"error": "Failed to create coupon"}
    except Exception as e:
        print(f"Error creating coupon: {e}")
        return {"error": str(e)}

def redeem_coupon(uid: str, code: str) -> Dict[str, Any]:
    """Redeem a coupon code for a user."""
    try:
        # Get coupon
        coupon_result = supabase.table("coupons").select("*").eq("code", code.upper()).execute()
        
        if not coupon_result.data or len(coupon_result.data) == 0:
            return {"success": False, "error": "Invalid coupon code"}
        
        coupon = coupon_result.data[0]
        
        # Check if coupon is active
        if not coupon["active"]:
            return {"success": False, "error": "Coupon is no longer active"}
        
        # Check expiration
        if coupon.get("expires_at"):
            expiration = datetime.fromisoformat(coupon["expires_at"].replace('Z', '+00:00'))
            if expiration < datetime.utcnow():
                return {"success": False, "error": "Coupon has expired"}
        
        # Check max uses
        if coupon["uses"] >= coupon["max_uses"]:
            return {"success": False, "error": "Coupon has reached maximum uses"}
        
        # Check if user already redeemed
        redemption_check = supabase.table("coupon_redemptions").select("*").eq(
            "coupon_id", coupon["id"]
        ).eq("uid", uid).execute()
        
        if redemption_check.data and len(redemption_check.data) > 0:
            return {"success": False, "error": "You have already redeemed this coupon"}
        
        # Redeem coupon - add credits
        if coupon["credits"] > 0:
            update_credits(uid, coupon["credits"])
        
        # Redeem coupon - add premium
        if coupon["premium_days"] > 0:
            set_premium(uid, True, coupon["premium_days"])
        
        # Increment uses
        supabase.table("coupons").update({
            "uses": coupon["uses"] + 1
        }).eq("id", coupon["id"]).execute()
        
        # Record redemption
        supabase.table("coupon_redemptions").insert({
            "coupon_id": coupon["id"],
            "uid": uid,
            "redeemed_at": datetime.utcnow().isoformat()
        }).execute()
        
        return {
            "success": True,
            "credits": coupon["credits"],
            "premiumDays": coupon["premium_days"]
        }
    except Exception as e:
        print(f"Error redeeming coupon: {e}")
        return {"success": False, "error": str(e)}

def get_all_coupons() -> List[Dict[str, Any]]:
    """Get all coupons (admin only)."""
    try:
        result = supabase.table("coupons").select("*").order("created_at", desc=True).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error getting coupons: {e}")
        return []

def delete_coupon(coupon_id: str) -> bool:
    """Delete a coupon (admin only)."""
    try:
        result = supabase.table("coupons").delete().eq("id", coupon_id).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error deleting coupon: {e}")
        return False

def get_all_users() -> List[Dict[str, Any]]:
    """Get all users (admin only)."""
    try:
        result = supabase.table("users").select("*").order("created_at", desc=True).execute()
        
        if result.data:
            return [{
                "uid": user["uid"],
                "email": user["email"],
                "credits": user["credits"],
                "isPremium": user["is_premium"],
                "isAdmin": user["is_admin"],
                "createdAt": user["created_at"]
            } for user in result.data]
        return []
    except Exception as e:
        print(f"Error getting users: {e}")
        return []

def get_stats() -> Dict[str, Any]:
    """Get platform statistics (admin only)."""
    try:
        # Total users
        users_result = supabase.table("users").select("id", count="exact").execute()
        total_users = users_result.count if users_result.count else 0
        
        # Premium users
        premium_result = supabase.table("users").select("id", count="exact").eq("is_premium", True).execute()
        premium_users = premium_result.count if premium_result.count else 0
        
        # Total predictions
        predictions_result = supabase.table("predictions").select("id", count="exact").execute()
        total_predictions = predictions_result.count if predictions_result.count else 0
        
        # Active coupons
        coupons_result = supabase.table("coupons").select("id", count="exact").eq("active", True).execute()
        active_coupons = coupons_result.count if coupons_result.count else 0
        
        return {
            "totalUsers": total_users,
            "premiumUsers": premium_users,
            "totalPredictions": total_predictions,
            "activeCoupons": active_coupons
        }
    except Exception as e:
        print(f"Error getting stats: {e}")
        return {
            "totalUsers": 0,
            "premiumUsers": 0,
            "totalPredictions": 0,
            "activeCoupons": 0
        }

# Initialize database on import
print(f"✅ Supabase database connected: {SUPABASE_URL}")
