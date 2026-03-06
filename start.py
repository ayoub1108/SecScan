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

def run_service(name, command, working_dir, port=None, use_shell=False):
    """Run a service silently in the background exactly like manual commands"""
    print_color(f"\n[+] Starting {name}..." + (f" (Port {port})" if port else ""), "yellow")
    
    full_path = Path(working_dir).absolute()
    if not full_path.exists():
        print_color(f"    ❌ Directory not found: {full_path}", "red")
        return None
    
    try:
        # Change to the working directory
        os.chdir(full_path)
        
        # For Windows - use CREATE_NO_WINDOW flag
        if sys.platform == "win32":
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
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                stdin=subprocess.DEVNULL,
                cwd=str(full_path)
            )
        
        print_color(f"    ✅ {name} started (PID: {process.pid})", "green")
        return process
        
    except Exception as e:
        print_color(f"    ❌ Failed: {e}", "red")
        return None
    finally:
        # Change back to original directory
        os.chdir(Path(__file__).parent)

def main():
    root_dir = Path(__file__).parent.absolute()
    processes = []
    
    print_color("=" * 60, "cyan")
    print_color("   🚀 SecScan - All Services Runner (No Windows)", "cyan")
    print_color("=" * 60, "cyan")
    print_color(f"📂 Root directory: {root_dir}", "blue")
    print()
    
    # 1. Database API (from database folder)
    db_dir = root_dir / "database"
    if db_dir.exists():
        proc = run_service(
            "Database API", 
            ["python", "database_api.py"], 
            db_dir, 
            port=5050,
            use_shell=False
        )
        if proc: processes.append(("Database API", proc))
        time.sleep(3)
    else:
        print_color(f"    ❌ Database folder not found: {db_dir}", "red")
    
    # 2. Database GUI
    if db_dir.exists():
        proc = run_service(
            "Database GUI", 
            ["python", "database_gui.py"], 
            db_dir,
            use_shell=False
        )
        if proc: processes.append(("Database GUI", proc))
        time.sleep(2)
    
   
    
    # 4. Agentic Security
    agentic_dir = root_dir / "agentic-security"
    if agentic_dir.exists():
        proc = run_service(
            "Agentic Security", 
            "npm run dev",
            agentic_dir, 
            port=8080,
            use_shell=True
        )
        if proc: processes.append(("Agentic Security", proc))
        time.sleep(3)
    else:
        print_color(f"    ⚠️  Agentic Security folder not found: {agentic_dir}", "yellow")
    
    # 5. React Frontend
    frontend_dir = root_dir / "frontend"
    if frontend_dir.exists():
        proc = run_service(
            "React Frontend", 
            "npm start",
            frontend_dir, 
            port=3000,
            use_shell=True
        )
        if proc: processes.append(("React Frontend", proc))
        time.sleep(2)
    else:
        print_color(f"    ⚠️  Frontend folder not found: {frontend_dir}", "yellow")
    
    # Summary
    print_color("\n" + "=" * 60, "cyan")
    print_color("   🎉 All Services Running in Background!", "cyan")
    print_color("=" * 60, "cyan")
    
    print_color("\n📊 Running Services:", "blue")
    for name, proc in processes:
        print_color(f"   • {name:20} - PID: {proc.pid}", "green")
    
    print_color("\n📡 Endpoints:", "yellow")
    print_color("   • Database API     - http://localhost:5050", "white")
    print_color("   • Web Security     - http://localhost:5000", "white")
    print_color("   • Agentic Security - http://localhost:8080", "white")
    print_color("   • React Frontend   - http://localhost:3000", "white")
    print_color("   • Database GUI     - (Background process)", "white")
    
    print_color("\n📁 Log files are in each service's output", "gray")
    print_color("\n⚠️  To stop all services, press Ctrl+C", "yellow")
    print_color("\n📌 Monitoring services...", "cyan")
    
    try:
        while True:
            time.sleep(2)
            for name, proc in processes[:]:
                if proc.poll() is not None:
                    print_color(f"\n❌ {name} stopped unexpectedly (exit code: {proc.returncode})!", "red")
                    processes.remove((name, proc))
    except KeyboardInterrupt:
        print_color("\n\n👋 Stopping all services...", "yellow")
        for name, proc in processes:
            print_color(f"   Stopping {name}...", "yellow")
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except:
                proc.kill()
        print_color("✅ All services stopped.", "green")

if __name__ == "__main__":
    main()