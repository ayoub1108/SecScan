
# EXAMPLE: DO NOT USE IN PRODUCTION
# This is a demonstration file showing what NOT to do

import hashlib
import base64

# Critical: Using weak cryptographic algorithms
def hash_password(password):
    # MD5 is cryptographically broken and unsuitable for further use
    return hashlib.md5(password.encode()).hexdigest()

# High: Using outdated encryption
def encrypt_data(data, key):
    # Simple XOR encryption (very weak)
    encrypted = []
    for i in range(len(data)):
        encrypted.append(chr(ord(data[i]) ^ ord(key[i % len(key)])))
    return base64.b64encode(''.join(encrypted).encode()).decode()

# Medium: Using weak encryption key
def generate_key():
    # Predictable key generation
    return "fixed_key_12345"

# The correct way would use strong algorithms like Argon2 for passwords
# and AES for encryption with proper key management

if __name__ == "__main__":
    print("This is an example vulnerability - do not use in real applications")
