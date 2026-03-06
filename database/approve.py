import sqlite3
from datetime import datetime

# Connect to database
conn = sqlite3.connect('users.db')
cursor = conn.cursor()

# Username to approve
username = 'john_doe'  # Change this to your username

# Update the user
cursor.execute("UPDATE users SET status=?, approved_at=? WHERE username=?", 
               ('approved', datetime.now(), username))

if cursor.rowcount > 0:
    print(f' User {username} approved successfully!')
else:
    print(f' User {username} not found!')
    
    # Show all users to help debug
    cursor.execute("SELECT username, status FROM users")
    users = cursor.fetchall()
    print("\n Available users:")
    for user in users:
        print(f"   - {user[0]} ({user[1]})")

conn.commit()
conn.close()
