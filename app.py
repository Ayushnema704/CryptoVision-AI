from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import yfinance as yf
# Lazy model loading to avoid hard dependency break at import-time (helps IDEs and systems
# where TensorFlow isn't installed). We'll try tensorflow.keras first, then standalone keras.
import importlib
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
import matplotlib
import matplotlib.pyplot as plt
import io
import base64
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Choose database backend: Supabase or SQLite
USE_SUPABASE = os.getenv("USE_SUPABASE", "false").lower() == "true"

if USE_SUPABASE:
    print("🔄 Using Supabase database...")
    import database_supabase as database  # type: ignore
else:
    print("🔄 Using SQLite database...")
    import database  # type: ignore # Local SQLite database for user management
    # Initialize SQLite database
    database.init_db()

# Set Matplotlib to non-interactive backend
matplotlib.use('Agg')

app = Flask(__name__)
# Enable CORS for React frontend with explicit configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:9002", "http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

# Path to the pre-trained model file
import os
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.keras")

# In-memory model object (None if loading failed)
model = None


def load_ml_model(path=MODEL_PATH):
    """Try to load the model using multiple loaders.

    Returns the loaded model or None on failure. Does not raise to avoid crashing the app
    when TensorFlow/keras are not available in the environment.
    """
    global model
    if model is not None:
        return model

    loaders = [
        ("tensorflow.keras.models", "load_model"),
        ("keras.models", "load_model"),
    ]

    for module_name, func_name in loaders:
        try:
            mod = importlib.import_module(module_name)
            loader = getattr(mod, func_name)
            # Try loading with different approaches for compatibility
            try:
                # First try as .h5 format
                h5_path = path.replace('.keras', '.h5')
                if os.path.exists(h5_path):
                    m = loader(h5_path, compile=False)
                else:
                    m = loader(path, compile=False)
            except Exception as e:
                # If that fails, try with custom_objects to handle old parameters
                try:
                    # Custom objects to handle old LSTM parameters
                    def custom_lstm(*args, **kwargs):
                        # Remove deprecated parameters
                        kwargs.pop('time_major', None)
                        # Import dynamically to avoid static analysis issues
                        tf_keras = importlib.import_module('tensorflow.keras.layers')
                        LSTM = getattr(tf_keras, 'LSTM')
                        return LSTM(*args, **kwargs)
                    
                    custom_objects = {'LSTM': custom_lstm}
                    h5_path = path.replace('.keras', '.h5')
                    if os.path.exists(h5_path):
                        m = loader(h5_path, custom_objects=custom_objects, compile=False)
                    else:
                        m = loader(path, custom_objects=custom_objects, compile=False)
                except Exception:
                    raise e
            
            model = m
            print(f"Loaded model using {module_name}.{func_name}")
            return model
        except Exception as exc:  # import or load error
            print(f"Could not load model with {module_name}: {exc}")
            continue

    print("Model not loaded; continuing without ML model. Predictions will be disabled.")
    return None


# Attempt to load the model at startup but don't let failures stop the app.
load_ml_model()

# Helper Function to Convert Matplotlib Plots to HTML
def plot_to_html(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    buf.seek(0)
    data = base64.b64encode(buf.getbuffer()).decode("ascii")
    buf.close()
    return f"data:image/png;base64,{data}"

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        'message': 'Crypto Predictor API',
        'version': '2.0',
        'endpoints': {
            'predict': '/api/predict (POST)',
            'health': '/api/health (GET)'
        },
        'frontend': 'React app running on http://localhost:5173'
    })

@app.route("/predict")
def predict():
    # Check if model is available
    if model is None:
        load_ml_model()  # Try loading again
        if model is None:
            return render_template("result.html", 
                                 error="Machine learning model not available. TensorFlow/Keras installation required for predictions.",
                                 stock_info={"symbol": request.args.get("stock", "BTC-USD")})
    
    stock = request.args.get("stock", "BTC-USD")
    no_of_days = int(request.args.get("no_of_days", 10))

    # Fetch Stock Data
    end = datetime.now()
    start = datetime(end.year - 10, end.month, end.day)
    stock_data = yf.download(stock, start, end)
    if stock_data.empty:
        return render_template("result.html", error="Invalid stock ticker or no data available.")

    # Data Preparation - FIT SCALER ON ENTIRE DATASET to handle future prices correctly
    splitting_len = int(len(stock_data) * 0.9)
    x_test = stock_data[['Close']][splitting_len:]
    
    # Critical fix: Fit scaler on ALL data, not just test data
    # This ensures future prices outside test range can still be normalized correctly
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaler.fit(stock_data[['Close']])  # Fit on entire dataset
    
    # Now transform only the test data
    scaled_data = scaler.transform(x_test)

    x_data = []
    y_data = []
    for i in range(100, len(scaled_data)):
        x_data.append(scaled_data[i - 100:i])
        y_data.append(scaled_data[i])

    x_data = np.array(x_data)
    y_data = np.array(y_data)

    # Predictions
    predictions = model.predict(x_data)
    inv_predictions = scaler.inverse_transform(predictions)
    inv_y_test = scaler.inverse_transform(y_data)

    # Calculate MSE and RMSE
    mse = mean_squared_error(inv_y_test.flatten(), inv_predictions.flatten())
    rmse = np.sqrt(mse)

    # Prepare Data for Plotting
    plotting_data = pd.DataFrame({
        'Original Test Data': inv_y_test.flatten(),
        'Predicted Test Data': inv_predictions.flatten()
    }, index=x_test.index[100:])

    # Generate Plots
    # Plot 1: Original Closing Prices
    fig1 = plt.figure(figsize=(15, 6))
    plt.plot(stock_data['Close'], 'b', label='Close Price')
    plt.title("Closing Prices Over Time")
    plt.xlabel("Date")
    plt.ylabel("Close Price")
    plt.legend()
    original_plot = plot_to_html(fig1)

    # Plot 2: Original vs Predicted Test Data
    fig2 = plt.figure(figsize=(15, 6))
    plt.plot(plotting_data['Original Test Data'], label="Original Test Data")
    plt.plot(plotting_data['Predicted Test Data'], label="Predicted Test Data", linestyle="--")
    plt.legend()
    plt.title("Original vs Predicted Closing Prices")
    plt.xlabel("Date")
    plt.ylabel("Close Price")
    predicted_plot = plot_to_html(fig2)

    # Plot 3: Future Predictions
    last_100 = stock_data[['Close']].tail(100)
    last_100_scaled = scaler.transform(last_100)

    future_predictions = []
    last_100_scaled = last_100_scaled.reshape(1, -1, 1)
    for _ in range(no_of_days):
        next_day = model.predict(last_100_scaled)
        future_predictions.append(scaler.inverse_transform(next_day))
        last_100_scaled = np.append(last_100_scaled[:, 1:, :], next_day.reshape(1, 1, -1), axis=1)

    future_predictions = np.array(future_predictions).flatten()

    fig3 = plt.figure(figsize=(15, 6))
    plt.plot(range(1, no_of_days + 1), future_predictions, marker='o', label="Predicted Future Prices", color="purple")
    plt.title("Future Close Price Predictions")
    plt.xlabel("Days Ahead")
    plt.ylabel("Predicted Close Price")
    plt.grid(alpha=0.3)
    plt.legend()
    future_plot = plot_to_html(fig3)

    return render_template(
        "result.html",
        stock=stock,
        original_plot=original_plot,
        predicted_plot=predicted_plot,
        future_plot=future_plot,
        enumerate=enumerate,
        future_predictions=future_predictions,
        mse=mse,
        rmse=rmse
    )

# API Endpoints for React Frontend
@app.route("/api/predict", methods=["POST"])
def api_predict():
    """API endpoint for predictions - returns JSON instead of HTML"""
    try:
        # Check if model is available
        if model is None:
            load_ml_model()
            if model is None:
                return jsonify({
                    "error": "Machine learning model not available. TensorFlow/Keras installation required.",
                    "success": False
                }), 500
        
        data = request.get_json()
        stock = data.get("stock", "BTC-USD")
        no_of_days = int(data.get("no_of_days", 10))

        # Fetch Stock Data
        end = datetime.now()
        start = datetime(end.year - 10, end.month, end.day)
        stock_data = yf.download(stock, start, end)
        
        if stock_data.empty:
            return jsonify({
                "error": "Invalid stock ticker or no data available.",
                "success": False
            }), 400

        # Data Preparation
        splitting_len = int(len(stock_data) * 0.9)
        x_test = stock_data[['Close']][splitting_len:]
        
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaler.fit(stock_data[['Close']])
        scaled_data = scaler.transform(x_test)

        x_data = []
        y_data = []
        for i in range(100, len(scaled_data)):
            x_data.append(scaled_data[i - 100:i])
            y_data.append(scaled_data[i])

        x_data = np.array(x_data)
        y_data = np.array(y_data)

        # Predictions
        predictions = model.predict(x_data)
        inv_predictions = scaler.inverse_transform(predictions)
        inv_y_test = scaler.inverse_transform(y_data)

        # Calculate metrics
        mse = mean_squared_error(inv_y_test.flatten(), inv_predictions.flatten())
        rmse = np.sqrt(mse)

        # Prepare historical data
        historical_data = []
        for i, date in enumerate(x_test.index[100:]):
            historical_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "original": float(inv_y_test.flatten()[i]),
                "predicted": float(inv_predictions.flatten()[i])
            })

        # Future Predictions
        last_100 = stock_data[['Close']].tail(100)
        last_100_scaled = scaler.transform(last_100)
        future_predictions = []
        last_100_scaled = last_100_scaled.reshape(1, -1, 1)
        
        for _ in range(no_of_days):
            next_day = model.predict(last_100_scaled)
            future_predictions.append(float(scaler.inverse_transform(next_day)[0][0]))
            last_100_scaled = np.append(last_100_scaled[:, 1:, :], next_day.reshape(1, 1, -1), axis=1)

        # Get stock info
        stock_info = yf.Ticker(stock)
        info = stock_info.info
        
        return jsonify({
            "success": True,
            "stock": stock,
            "stock_name": info.get("longName", stock),
            "current_price": float(stock_data['Close'].iloc[-1]),
            "mse": float(mse),
            "rmse": float(rmse),
            "historical_data": historical_data[-100:],  # Last 100 points
            "future_predictions": future_predictions,
            "total_data_points": len(stock_data)
        })
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route("/api/health", methods=["GET"])
def api_health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })

# User Management API Endpoints
@app.route("/api/users", methods=["POST"])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        uid = data.get("uid")
        email = data.get("email")
        
        if not uid or not email:
            return jsonify({
                "success": False,
                "error": "uid and email are required"
            }), 400
        
        user = database.create_user(uid, email)
        return jsonify({
            "success": True,
            "user": user
        })
    except Exception as e:
        print(f"❌ Error creating user: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/users/<uid>", methods=["GET"])
def get_user(uid):
    """Get user data"""
    try:
        print(f"🔍 Fetching user with UID: {uid}")
        user = database.get_user(uid)
        if user:
            print(f"✅ User found: {user['email']}")
            return jsonify({
                "success": True,
                "user": user
            })
        else:
            print(f"❌ User not found with UID: {uid}")
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
    except Exception as e:
        print(f"❌ Error fetching user: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/users/<uid>/credits", methods=["POST"])
def use_user_credit(uid):
    """Use one credit for a prediction"""
    try:
        print(f"🔔 Credit request received for UID: {uid}")
        
        # Check if user exists
        user = database.get_user(uid)
        if not user:
            print(f"❌ User not found: {uid}")
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        print(f"📊 Current user state: credits={user['credits']}, isPremium={user['isPremium']}")
        
        # Use credit
        success = database.use_credit(uid)
        print(f"💳 use_credit result: {success}")
        
        # Get updated user data
        user = database.get_user(uid)
        print(f"📊 Updated user state: credits={user['credits']}, isPremium={user['isPremium']}")
        
        return jsonify({
            "success": success,
            "user": user
        })
    except Exception as e:
        print(f"❌ Error in use_user_credit: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/users/<uid>/premium", methods=["POST"])
def set_user_premium(uid):
    """Set premium status for a user"""
    try:
        data = request.get_json()
        is_premium = data.get("isPremium", False)
        premium_days = data.get("premiumDays", 0)
        subscription_type = data.get("subscriptionType")
        payment_id = data.get("paymentId")
        
        success = database.set_premium(uid, is_premium, premium_days, subscription_type, payment_id)
        user = database.get_user(uid)
        
        return jsonify({
            "success": success,
            "user": user
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Admin API Endpoints
@app.route("/api/admin/coupons", methods=["GET"])
def get_coupons():
    """Get all coupons (admin only)"""
    try:
        coupons = database.get_all_coupons()
        return jsonify({
            "success": True,
            "coupons": coupons
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/admin/coupons", methods=["POST"])
def create_coupon_endpoint():
    """Create a new coupon (admin only)"""
    try:
        data = request.get_json()
        credits = data.get("credits", 0)
        premium_days = data.get("premiumDays", 0)
        max_uses = data.get("maxUses", 1)
        expires_at = data.get("expiresAt")
        created_by = data.get("createdBy", "")
        code = data.get("code")
        
        result = database.create_coupon(
            credits=credits,
            premium_days=premium_days,
            max_uses=max_uses,
            expires_at=expires_at,
            created_by=created_by,
            code=code
        )
        
        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 400
        
        return jsonify({
            "success": True,
            "coupon": result
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/admin/coupons/<int:coupon_id>", methods=["DELETE"])
def delete_coupon_endpoint(coupon_id):
    """Delete a coupon (admin only)"""
    try:
        success = database.delete_coupon(coupon_id)
        return jsonify({
            "success": success
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/coupons/redeem", methods=["POST"])
def redeem_coupon_endpoint():
    """Redeem a coupon"""
    try:
        data = request.get_json()
        uid = data.get("uid")
        code = data.get("code")
        
        if not uid or not code:
            return jsonify({
                "success": False,
                "error": "uid and code are required"
            }), 400
        
        result = database.redeem_coupon(uid, code)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/admin/users", methods=["GET"])
def get_all_users_endpoint():
    """Get all users (admin only)"""
    try:
        users = database.get_all_users()
        return jsonify({
            "success": True,
            "users": users
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/admin/stats", methods=["GET"])
def get_stats_endpoint():
    """Get platform statistics (admin only)"""
    try:
        stats = database.get_stats()
        return jsonify({
            "success": True,
            "stats": stats
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(debug=False, host='0.0.0.0', port=port)
