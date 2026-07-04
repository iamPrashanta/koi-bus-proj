import sqlite3
import os

DB_PATH = os.path.join("assets", "data", "koibus.db")

def run_analytics():
    print("Running Route Analytics...")
    if not os.path.exists(DB_PATH):
        print("Database not found!")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Route with most stops
    cursor.execute("""
        SELECT r.short_name, COUNT(rs.stop_id) as c
        FROM routes r
        JOIN route_stops rs ON r.id = rs.route_id
        GROUP BY r.id
        ORDER BY c DESC LIMIT 1
    """)
    most = cursor.fetchone()
    if most:
        print(f"Longest Route (by stops): {most[0]} with {most[1]} stops")

    # 2. Average Stops per route
    cursor.execute("""
        SELECT AVG(c) FROM (
            SELECT COUNT(stop_id) as c FROM route_stops GROUP BY route_id
        )
    """)
    avg = cursor.fetchone()
    if avg and avg[0]:
        print(f"Average Stops Per Route: {avg[0]:.1f}")

    # 3. Mapped Districts
    cursor.execute("SELECT COUNT(DISTINCT COALESCE(district, 'Unknown')) FROM stops")
    districts = cursor.fetchone()[0]
    print(f"Total Unique Districts Mapped: {districts}")

    conn.close()

if __name__ == "__main__":
    run_analytics()
