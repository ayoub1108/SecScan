from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

DATABASE = 'users.db'

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    """Hash a password using SHA-256 with salt"""
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt + key

def verify_password(stored_hash, password):
    """Verify a password against stored hash"""
    try:
        salt = stored_hash[:32]
        key = stored_hash[32:]
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return key == new_key
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    """Login user"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        logger.info(f"Login attempt: {data.get('username') if data else 'No data'}")
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check users table
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        
        if user:
            logger.info(f"User found: {user['username']}, Status: {user['status']}")
            
            # Verify password
            if verify_password(user['password_hash'], password):
                # Check if approved
                if user['status'] == 'approved':
                    # Update last login
                    cursor.execute('''
                        UPDATE users SET last_login = ? WHERE id = ?
                    ''', (datetime.now(), user['id']))
                    conn.commit()
                    
                    logger.info(f"✅ Login successful: {username}")
                    conn.close()
                    return jsonify({
                        'success': True,
                        'username': user['username'],
                        'email': user['email'],
                        'role': user['role'] if 'role' in user.keys() else 'user',
                        'status': user['status'],
                        'token': 'auth-token-' + str(user['id'])
                    })
                else:
                    logger.info(f"⏳ Pending account: {username}")
                    conn.close()
                    return jsonify({
                        'success': False, 
                        'message': 'Account pending admin approval'
                    }), 401
            else:
                logger.info(f"❌ Invalid password for: {username}")
                conn.close()
                return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        
        # Check admins table
        cursor.execute('SELECT * FROM admins WHERE username = ?', (username,))
        admin = cursor.fetchone()
        
        if admin and verify_password(admin['password_hash'], password):
            logger.info(f"👑 Admin login: {username}")
            conn.close()
            return jsonify({
                'success': True,
                'username': admin['username'],
                'role': 'admin',
                'status': 'approved',
                'token': 'admin-token-' + str(admin['id'])
            })
        
        conn.close()
        logger.warning(f"❌ User not found: {username}")
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("="*50)
    logger.info("🚀 Starting API server...")
    logger.info(f"📁 Database: {DATABASE}")
    logger.info("🌐 API running at: http://localhost:5050")
    logger.info("="*50)
    app.run(debug=True, port=5050)