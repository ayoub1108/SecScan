import os
import sys
import time
import subprocess
from pathlib import Path

# Disable console windows on Windows
if sys.platform == "win32":
    CREATE_NO_WINDOW = 0x08000000
else:
    CREATE_NO_WINDOW = 0

def print_color(text, color="white"):
    """Simple colored printing"""
    colors = {
        "green": "\033[92m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "red": "\033[91m",
        "cyan": "\033[96m",
        "end": "\033[0m"
    }
    print(f"{colors.get(color, '')}{text}{colors['end']}")

def run_service(name, command, working_dir, port=None, use_shell=False, show_output=True):
    """Run a service in the background"""
    print_color(f"\n[+] Starting {name}..." + (f" (Port {port})" if port else ""), "yellow")
    
    full_path = Path(working_dir).absolute()
    if not full_path.exists():
        print_color(f"    ❌ Directory not found: {full_path}", "red")
        return None
    
    try:
        os.chdir(full_path)
        
        print_color(f"    📁 Working dir: {full_path}", "blue")
        print_color(f"    🔧 Command: {command}", "blue")
        
        # For Windows - use CREATE_NO_WINDOW flag to hide console windows
        if sys.platform == "win32":
            if show_output:
                # Show output in current console (for debugging)
                process = subprocess.Popen(
                    command,
                    shell=use_shell,
                    cwd=str(full_path)
                )
            else:
                # Hide output completely
                process = subprocess.Popen(
                    command,
                    shell=use_shell,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    stdin=subprocess.DEVNULL,
                    creationflags=CREATE_NO_WINDOW,
                    cwd=str(full_path)
                )
        else:
            process = subprocess.Popen(
                command,
                shell=use_shell,
                cwd=str(full_path)
            )
        
        print_color(f"    ✅ {name} started (PID: {process.pid})", "green")
        return process
        
    except Exception as e:
        print_color(f"    ❌ Failed: {e}", "red")
        return None
    finally:
        os.chdir(Path(__file__).parent)

def main():
    root_dir = Path(__file__).parent.absolute()
    processes = []
    
    print_color("=" * 60, "cyan")
    print_color("   🚀 SecScan - All Services Runner", "cyan")
    print_color("=" * 60, "cyan")
    print_color(f"📂 Root directory: {root_dir}", "blue")
    print()
    
    # =========================================================
    # 1. Web Security Scanner (YOUR FLASK APP)
    # =========================================================
    web_scanner_dir = root_dir
    app_file = web_scanner_dir / "app.py"
    
    print_color(f"🔍 Looking for app.py at: {app_file}", "blue")
    
    if app_file.exists():
        print_color(f"    ✅ Found app.py!", "green")
        # Using the exact command you tested: python.exe .\app.py
        proc = run_service(
            "Web Security Scanner", 
            ["python.exe", "app.py"],  # Changed to python.exe for Windows
            web_scanner_dir, 
            port=5000,
            use_shell=False,
            show_output=True  # Show output so you can see the server running
        )
        if proc: 
            processes.append(("Web Security Scanner", proc, 5000))
            print_color(f"    🌐 Web Scanner will be available at: http://localhost:5000", "green")
        time.sleep(5)  # Give it more time to start
    else:
        print_color(f"    ❌ app.py NOT found at: {app_file}", "red")
        print_color(f"    💡 Make sure you're running start.py from the same folder as app.py", "yellow")
    
    # =========================================================
    # 2. Database API (from database folder)
    # =========================================================
    db_dir = root_dir / "database"
    if db_dir.exists():
        api_file = db_dir / "database_api.py"
        if api_file.exists():
            proc = run_service(
                "Database API", 
                ["python.exe", "database_api.py"], 
                db_dir, 
                port=5050,
                use_shell=False,
                show_output=False
            )
            if proc: 
                processes.append(("Database API", proc, 5050))
            time.sleep(2)
        else:
            print_color(f"    ⚠️  database_api.py not found in {db_dir}", "yellow")
    else:
        print_color(f"    ⚠️  Database folder not found: {db_dir}", "yellow")
    
    # =========================================================
    # 3. Database GUI
    # =========================================================
    if db_dir.exists():
        gui_file = db_dir / "database_gui.py"
        if gui_file.exists():
            proc = run_service(
                "Database GUI", 
                ["python.exe", "database_gui.py"], 
                db_dir,
                use_shell=False,
                show_output=False
            )
            if proc: 
                processes.append(("Database GUI", proc, None))
            time.sleep(2)
        else:
            print_color(f"    ⚠️  database_gui.py not found in {db_dir}", "yellow")
    
    # =========================================================
    # 4. Agentic Security
    # =========================================================
    agentic_dir = root_dir / "agentic-security"
    if agentic_dir.exists():
        proc = run_service(
            "Agentic Security", 
            "npm run dev",
            agentic_dir, 
            port=8080,
            use_shell=True,
            show_output=False
        )
        if proc: 
            processes.append(("Agentic Security", proc, 8080))
        time.sleep(3)
    else:
        print_color(f"    ⚠️  Agentic Security folder not found: {agentic_dir}", "yellow")
    
    # =========================================================
    # 5. React Frontend
    # =========================================================
    frontend_dir = root_dir / "frontend"
    if frontend_dir.exists():
        proc = run_service(
            "React Frontend", 
            "npm start",
            frontend_dir, 
            port=3000,
            use_shell=True,
            show_output=False
        )
        if proc: 
            processes.append(("React Frontend", proc, 3000))
        time.sleep(2)
    else:
        print_color(f"    ⚠️  Frontend folder not found: {frontend_dir}", "yellow")
    
    # =========================================================
    # Summary
    # =========================================================
    print_color("\n" + "=" * 60, "cyan")
    print_color("   🎉 Service Startup Complete!", "cyan")
    print_color("=" * 60, "cyan")
    
    print_color("\n📊 Running Services:", "blue")
    for name, proc, port in processes:
        if port:
            print_color(f"   • {name:22} - PID: {proc.pid} → http://localhost:{port}", "green")
        else:
            print_color(f"   • {name:22} - PID: {proc.pid}", "green")
    
    print_color("\n📡 Access Your Services:", "yellow")
    print_color("   🔗 Web Security Scanner  → http://localhost:5000", "cyan")
    print_color("   🔗 Database API         → http://localhost:5050", "cyan")
    print_color("   🔗 Agentic Security     → http://localhost:8080", "cyan")
    print_color("   🔗 React Frontend       → http://localhost:3000", "cyan")
    
    print_color("\n⚠️  To stop all services, press Ctrl+C", "yellow")
    print_color("\n📌 Monitoring services...", "cyan")
    
    try:
        while True:
            time.sleep(2)
            for item in processes[:]:
                name, proc, port = item
                if proc.poll() is not None:
                    print_color(f"\n❌ {name} stopped unexpectedly (exit code: {proc.returncode})!", "red")
                    processes.remove(item)
    except KeyboardInterrupt:
        print_color("\n\n👋 Stopping all services...", "yellow")
        for name, proc, port in processes:
            print_color(f"   Stopping {name}...", "yellow")
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except:
                proc.kill()
        print_color("✅ All services stopped.", "green")

if __name__ == "__main__":
    main()