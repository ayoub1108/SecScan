import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3
import hashlib
import os
from datetime import datetime

# Database functions
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
    except:
        return False

def init_database():
    """Initialize database"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash BLOB NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # Create admins table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash BLOB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create default admin
    admin_password = hash_password("admin123")
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO admins (username, password_hash)
            VALUES (?, ?)
        ''', ('admin', admin_password))
    except:
        pass
    
    conn.commit()
    conn.close()
    print("✅ Database initialized")

class DatabaseGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🗄️ Database Manager - Security Scanner")
        self.root.geometry("900x600")
        self.root.configure(bg='#2c3e50')
        
        # Initialize database
        init_database()
        
        # Create GUI
        self.create_widgets()
        self.load_users()
    
    def create_widgets(self):
        # Title
        title = tk.Label(self.root, text="🗄️ DATABASE MANAGEMENT", 
                        font=('Arial', 20, 'bold'), 
                        bg='#2c3e50', fg='white')
        title.pack(pady=20)
        
        # Stats Frame
        stats_frame = tk.Frame(self.root, bg='#34495e', relief='ridge', bd=2)
        stats_frame.pack(fill='x', padx=20, pady=10)
        
        self.stats_label = tk.Label(stats_frame, text="Loading stats...", 
                                   font=('Arial', 12),
                                   bg='#34495e', fg='#ecf0f1')
        self.stats_label.pack(pady=10)
        
        # Button Frame
        button_frame = tk.Frame(self.root, bg='#2c3e50')
        button_frame.pack(pady=20)
        
        # Buttons
        buttons = [
            ("1. Setup Database", self.setup_db, '#27ae60'),
            ("2. Add New User", self.add_user, '#2980b9'),
            ("3. List All Users", self.load_users, '#8e44ad'),
            ("4. List Pending Users", self.pending_users, '#f39c12'),
            ("5. Approve User", self.approve_user, '#16a085'),
            ("6. Delete User", self.delete_user, '#e74c3c'),
            ("7. Test Login", self.test_login, '#d35400'),
            ("8. Exit", self.exit_app, '#7f8c8d')
        ]
        
        for i, (text, command, color) in enumerate(buttons):
            btn = tk.Button(button_frame, text=text, command=command,
                          font=('Arial', 11, 'bold'),
                          bg=color, fg='white',
                          width=20, height=2,
                          relief='raised', bd=3)
            btn.grid(row=i//2, column=i%2, padx=10, pady=5)
        
        # Treeview Frame
        tree_frame = tk.Frame(self.root, bg='#2c3e50')
        tree_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # Scrollbars
        v_scroll = ttk.Scrollbar(tree_frame)
        v_scroll.pack(side='right', fill='y')
        
        h_scroll = ttk.Scrollbar(tree_frame, orient='horizontal')
        h_scroll.pack(side='bottom', fill='x')
        
        # Treeview
        self.tree = ttk.Treeview(tree_frame, 
                                 columns=('ID', 'Username', 'Email', 'Status', 'Created'),
                                 show='headings',
                                 yscrollcommand=v_scroll.set,
                                 xscrollcommand=h_scroll.set)
        
        # Define headings
        self.tree.heading('ID', text='ID')
        self.tree.heading('Username', text='Username')
        self.tree.heading('Email', text='Email')
        self.tree.heading('Status', text='Status')
        self.tree.heading('Created', text='Created Date')
        
        # Set column widths
        self.tree.column('ID', width=50, anchor='center')
        self.tree.column('Username', width=150, anchor='w')
        self.tree.column('Email', width=200, anchor='w')
        self.tree.column('Status', width=120, anchor='center')
        self.tree.column('Created', width=150, anchor='center')
        
        self.tree.pack(fill='both', expand=True)
        
        # Configure scrollbars
        v_scroll.config(command=self.tree.yview)
        h_scroll.config(command=self.tree.xview)
        
        # Configure tags for colors
        self.tree.tag_configure('pending', background='#fff3cd')
        self.tree.tag_configure('approved', background='#d4edda')
        
        # Status bar
        self.status_bar = tk.Label(self.root, text="Ready", 
                                   bg='#34495e', fg='#ecf0f1',
                                   font=('Arial', 10))
        self.status_bar.pack(side='bottom', fill='x')
    
    def update_stats(self):
        """Update statistics in the stats label"""
        try:
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM users")
            total = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE status='pending'")
            pending = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE status='approved'")
            approved = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM admins")
            admins = cursor.fetchone()[0]
            
            conn.close()
            
            stats_text = f"📊 Total Users: {total} | ⏳ Pending: {pending} | ✅ Approved: {approved} | 👑 Admins: {admins}"
            self.stats_label.config(text=stats_text)
        except Exception as e:
            self.stats_label.config(text=f"Error loading stats: {e}")
    
    def load_users(self):
        """Load users into treeview"""
        try:
            # Clear existing items
            for item in self.tree.get_children():
                self.tree.delete(item)
            
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, status, created_at 
                FROM users 
                ORDER BY 
                    CASE status 
                        WHEN 'pending' THEN 1
                        ELSE 2
                    END,
                    created_at DESC
            ''')
            
            users = cursor.fetchall()
            conn.close()
            
            # Add to treeview
            for user in users:
                # Format date
                created = str(user[4])[:19] if user[4] else "N/A"
                
                # Status display
                status_display = "⏳ Pending" if user[3] == 'pending' else "✅ Approved"
                
                # Insert
                item = self.tree.insert('', 'end', values=(
                    user[0], user[1], user[2], status_display, created
                ))
                
                # Apply tag
                if user[3] == 'pending':
                    self.tree.item(item, tags=('pending',))
                else:
                    self.tree.item(item, tags=('approved',))
            
            self.update_stats()
            self.status_bar.config(text=f"✅ Loaded {len(users)} users")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load users: {e}")
    
    def setup_db(self):
        """Setup database"""
        init_database()
        self.load_users()
        messagebox.showinfo("Success", "Database setup complete!")
    
    def pending_users(self):
        """Show only pending users"""
        try:
            # Clear existing items
            for item in self.tree.get_children():
                self.tree.delete(item)
            
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, status, created_at 
                FROM users 
                WHERE status='pending'
                ORDER BY created_at DESC
            ''')
            
            users = cursor.fetchall()
            conn.close()
            
            for user in users:
                created = str(user[4])[:19] if user[4] else "N/A"
                self.tree.insert('', 'end', values=(
                    user[0], user[1], user[2], "⏳ Pending", created
                ), tags=('pending',))
            
            self.status_bar.config(text=f"📋 Showing {len(users)} pending users")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load pending users: {e}")
    
    def approve_user(self):
        """Approve selected user"""
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Warning", "Please select a user to approve")
            return
        
        item = self.tree.item(selected[0])
        user_id = item['values'][0]
        username = item['values'][1]
        
        if messagebox.askyesno("Confirm", f"Approve user '{username}'?"):
            try:
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()
                
                cursor.execute('''
                    UPDATE users 
                    SET status = 'approved', approved_at = ?
                    WHERE id = ? AND status = 'pending'
                ''', (datetime.now(), user_id))
                
                conn.commit()
                conn.close()
                
                if cursor.rowcount > 0:
                    messagebox.showinfo("Success", f"User '{username}' approved!")
                    self.load_users()
                else:
                    messagebox.showerror("Error", "User not found or already approved")
                    
            except Exception as e:
                messagebox.showerror("Error", str(e))
    
    def delete_user(self):
        """Delete selected user"""
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Warning", "Please select a user to delete")
            return
        
        item = self.tree.item(selected[0])
        user_id = item['values'][0]
        username = item['values'][1]
        
        if messagebox.askyesno("Confirm", f"Delete user '{username}'?\nThis cannot be undone!"):
            try:
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()
                
                cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
                conn.commit()
                conn.close()
                
                if cursor.rowcount > 0:
                    messagebox.showinfo("Success", f"User '{username}' deleted!")
                    self.load_users()
                    
            except Exception as e:
                messagebox.showerror("Error", str(e))
    
    def add_user(self):
        """Add new user dialog"""
        dialog = tk.Toplevel(self.root)
        dialog.title("Add New User")
        dialog.geometry("400x400")
        dialog.configure(bg='#34495e')
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center dialog
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() // 2) - (400 // 2)
        y = (dialog.winfo_screenheight() // 2) - (400 // 2)
        dialog.geometry(f'+{x}+{y}')
        
        # Form fields
        fields = [
            ("Username:", 'username'),
            ("Email:", 'email'),
            ("Password:", 'password'),
            ("Confirm Password:", 'confirm')
        ]
        
        entries = {}
        row = 0
        
        for label, key in fields:
            tk.Label(dialog, text=label, bg='#34495e', fg='white',
                    font=('Arial', 11)).grid(row=row, column=0, padx=10, pady=10, sticky='e')
            
            entry = tk.Entry(dialog, font=('Arial', 11), width=25)
            if 'password' in key:
                entry.config(show='*')
            entry.grid(row=row, column=1, padx=10, pady=10)
            entries[key] = entry
            row += 1
        
        # Status
        tk.Label(dialog, text="Status:", bg='#34495e', fg='white',
                font=('Arial', 11)).grid(row=row, column=0, padx=10, pady=10, sticky='e')
        
        status_var = tk.StringVar(value='pending')
        status_combo = ttk.Combobox(dialog, textvariable=status_var, 
                                   values=['pending', 'approved'], 
                                   state='readonly', width=23)
        status_combo.grid(row=row, column=1, padx=10, pady=10)
        row += 1
        
        def save():
            username = entries['username'].get()
            email = entries['email'].get()
            password = entries['password'].get()
            confirm = entries['confirm'].get()
            status = status_var.get()
            
            if not all([username, email, password]):
                messagebox.showerror("Error", "All fields required!")
                return
            
            if password != confirm:
                messagebox.showerror("Error", "Passwords do not match!")
                return
            
            try:
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()
                
                password_hash = hash_password(password)
                cursor.execute('''
                    INSERT INTO users (username, email, password_hash, status)
                    VALUES (?, ?, ?, ?)
                ''', (username, email, password_hash, status))
                
                conn.commit()
                conn.close()
                
                messagebox.showinfo("Success", f"User '{username}' added!")
                dialog.destroy()
                self.load_users()
                
            except sqlite3.IntegrityError:
                messagebox.showerror("Error", "Username or email already exists!")
            except Exception as e:
                messagebox.showerror("Error", str(e))
        
        # Buttons
        btn_frame = tk.Frame(dialog, bg='#34495e')
        btn_frame.grid(row=row, column=0, columnspan=2, pady=20)
        
        tk.Button(btn_frame, text="Save", command=save,
                 bg='#27ae60', fg='white', font=('Arial', 11, 'bold'),
                 width=10).pack(side='left', padx=5)
        
        tk.Button(btn_frame, text="Cancel", command=dialog.destroy,
                 bg='#e74c3c', fg='white', font=('Arial', 11, 'bold'),
                 width=10).pack(side='left', padx=5)
    
    def test_login(self):
        """Test login dialog"""
        dialog = tk.Toplevel(self.root)
        dialog.title("Test Login")
        dialog.geometry("350x250")
        dialog.configure(bg='#34495e')
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() // 2) - (350 // 2)
        y = (dialog.winfo_screenheight() // 2) - (250 // 2)
        dialog.geometry(f'+{x}+{y}')
        
        tk.Label(dialog, text="Username:", bg='#34495e', fg='white',
                font=('Arial', 11)).grid(row=0, column=0, padx=10, pady=20, sticky='e')
        
        username_entry = tk.Entry(dialog, font=('Arial', 11), width=20)
        username_entry.grid(row=0, column=1, padx=10, pady=20)
        
        tk.Label(dialog, text="Password:", bg='#34495e', fg='white',
                font=('Arial', 11)).grid(row=1, column=0, padx=10, pady=20, sticky='e')
        
        password_entry = tk.Entry(dialog, font=('Arial', 11), width=20, show='*')
        password_entry.grid(row=1, column=1, padx=10, pady=20)
        
        def do_login():
            username = username_entry.get()
            password = password_entry.get()
            
            if not username or not password:
                messagebox.showerror("Error", "Username and password required!")
                return
            
            try:
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()
                
                # Check users
                cursor.execute('SELECT password_hash, status FROM users WHERE username = ?', (username,))
                user = cursor.fetchone()
                
                if user and verify_password(user[0], password):
                    if user[1] == 'approved':
                        messagebox.showinfo("Success", f"✅ User login successful!")
                    else:
                        messagebox.showwarning("Pending", f"⏳ Account pending approval")
                
                # Check admins
                else:
                    cursor.execute('SELECT password_hash FROM admins WHERE username = ?', (username,))
                    admin = cursor.fetchone()
                    
                    if admin and verify_password(admin[0], password):
                        messagebox.showinfo("Success", f"👑 Admin login successful!")
                    else:
                        messagebox.showerror("Error", "❌ Invalid username or password")
                
                conn.close()
                dialog.destroy()
                
            except Exception as e:
                messagebox.showerror("Error", str(e))
        
        tk.Button(dialog, text="Login", command=do_login,
                 bg='#27ae60', fg='white', font=('Arial', 11, 'bold'),
                 width=10).grid(row=2, column=0, columnspan=2, pady=20)
    
    def exit_app(self):
        """Exit application"""
        if messagebox.askyesno("Exit", "Are you sure you want to exit?"):
            self.root.quit()

# Run the application
if __name__ == "__main__":
    root = tk.Tk()
    app = DatabaseGUI(root)
    root.mainloop()