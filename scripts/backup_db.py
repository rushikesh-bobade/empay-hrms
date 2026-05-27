import os
import subprocess
import datetime
from pathlib import Path

# Configuration
DB_USER = os.getenv("DB_USER", "postgres")
DB_NAME = os.getenv("DB_NAME", "empay_db")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

# Setup backup directory
BACKUP_DIR = Path(__file__).resolve().parent.parent / "backups"
BACKUP_DIR.mkdir(exist_ok=True)

def backup_database():
    """
    Creates a pg_dump backup of the PostgreSQL database.
    This is a developer utility script and does not affect the main Express/React application.
    """
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"empay_backup_{timestamp}.sql"
    
    print(f"📦 Starting database backup for {DB_NAME}...")
    
    command = [
        "pg_dump",
        "-U", DB_USER,
        "-h", DB_HOST,
        "-p", DB_PORT,
        "-F", "p", # plain text SQL
        "-f", str(backup_file),
        DB_NAME
    ]
    
    try:
        # Note: Requires pg_dump to be installed and in PATH
        # Will prompt for password unless PGPASSWORD is set in env
        subprocess.run(command, check=True, capture_output=True)
        print(f"✅ Backup successfully saved to: {backup_file}")
    except FileNotFoundError:
        print("⚠️  Warning: 'pg_dump' command not found. Make sure PostgreSQL tools are installed.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Backup failed: {e.stderr.decode('utf-8')}")

if __name__ == "__main__":
    print("--- EmPay HRMS Backup Utility ---")
    backup_database()
