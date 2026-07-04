import sqlite3
import os
import argparse

DB_PATH = os.path.join("assets", "data", "koibus.db")

def list_routes():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.short_name, r.long_name, COUNT(rs.stop_id) 
        FROM routes r
        LEFT JOIN route_stops rs ON r.id = rs.route_id
        GROUP BY r.id
    """)
    for row in cursor.fetchall():
        print(f"[{row[0]}] {row[1]}: {row[2]} ({row[3]} stops)")
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Koi Bus Route Editor")
    parser.add_argument("--list", action="store_true", help="List all routes")

    args = parser.parse_args()

    if args.list:
        list_routes()
    else:
        parser.print_help()
