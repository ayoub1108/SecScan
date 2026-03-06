
# EXAMPLE: DO NOT USE IN PRODUCTION
# This is a demonstration file showing what NOT to do

import sqlite3

# High: SQL Injection vulnerability
def get_user(username):
    conn = sqlite3.connect('example.db')
    cursor = conn.cursor()
    
    # Vulnerable to SQL injection
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    
    result = cursor.fetchone()
    conn.close()
    return result

# The correct way would be:
# def get_user_safe(username):
#     conn = sqlite3.connect('example.db')
#     cursor = conn.cursor()
#     
#     # Safe from SQL injection
#     query = "SELECT * FROM users WHERE username = ?"
#     cursor.execute(query, (username,))
#     
#     result = cursor.fetchone()
#     conn.close()
#     return result

if __name__ == "__main__":
    print("This is an example vulnerability - do not use in real applications")
