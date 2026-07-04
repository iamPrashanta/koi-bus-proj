import sqlite3
import os
import argparse
import uuid

DB_PATH = os.path.join("assets", "data", "koibus.db")

def add_stop(name, lat, lng, district):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    stop_id = str(uuid.uuid4())
    geohash = "00000000" # Placeholder for manual additions
    try:
        cursor.execute("""
            INSERT INTO stops (id, name, lat, lng, geohash, district)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (stop_id, name, lat, lng, geohash, district))
        conn.commit()
        print(f"Added stop {name} with ID {stop_id}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

def list_stops(limit=10):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, district, lat, lng FROM stops LIMIT ?", (limit,))
    for row in cursor.fetchall():
        print(f"[{row[0]}] {row[1]} ({row[2]}) - {row[3]},{row[4]}")
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Koi Bus Stop Editor")
    parser.add_argument("--list", action="store_true", help="List stops")
    parser.add_argument("--limit", type=int, default=10, help="Limit for listing")
    parser.add_argument("--add", action="store_true", help="Add a new stop")
    parser.add_argument("--name", type=str)
    parser.add_argument("--lat", type=float)
    parser.add_argument("--lng", type=float)
    parser.add_argument("--district", type=str)

    args = parser.parse_args()

    if args.list:
        list_stops(args.limit)
    elif args.add:
        if not all([args.name, args.lat, args.lng]):
            print("Missing --name, --lat, or --lng")
        else:
            add_stop(args.name, args.lat, args.lng, args.district)
    else:
        parser.print_help()
