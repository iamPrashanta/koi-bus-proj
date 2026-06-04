import sqlite3
import os
import csv
import json

def generate_reports():
    print("Phase 0D: Validation Engine & Reporting Started...")
    db_path = os.path.join("assets", "data", "koibus.db")
    reports_dir = "reports"
    os.makedirs(reports_dir, exist_ok=True)
    
    if not os.path.exists(db_path):
        print("Database not found!")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    summary = {}
    
    # 1. Total Counts
    cursor.execute("SELECT COUNT(*) FROM stops")
    summary['total_stops'] = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM routes")
    summary['total_routes'] = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM graph_edges")
    summary['total_graph_edges'] = cursor.fetchone()[0]
    
    # 2. Stop Coverage by District
    cursor.execute("""
        SELECT COALESCE(district, 'Unknown'), COUNT(*) as c
        FROM stops
        GROUP BY COALESCE(district, 'Unknown')
        ORDER BY c DESC
    """)
    districts = cursor.fetchall()
    summary['districts_mapped'] = len(districts)
    with open(os.path.join(reports_dir, "stop_coverage.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["District", "Stop Count"])
        writer.writerows(districts)
        
    # 3. Duplicate Stops
    cursor.execute("""
        SELECT name, COUNT(*) as c 
        FROM stops 
        GROUP BY name 
        HAVING c > 1
        ORDER BY c DESC
    """)
    dups = cursor.fetchall()
    summary['duplicate_stop_groups'] = len(dups)
    with open(os.path.join(reports_dir, "duplicate_stops.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Stop Name", "Occurrences"])
        writer.writerows(dups)
        
    # 4. Missing Coordinates
    cursor.execute("SELECT id, name FROM stops WHERE lat = 0.0 OR lng = 0.0")
    missing_coords = cursor.fetchall()
    summary['missing_coordinates'] = len(missing_coords)
    with open(os.path.join(reports_dir, "missing_coordinates.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Stop ID", "Stop Name"])
        writer.writerows(missing_coords)
        
    # 5. Route Continuity
    cursor.execute("""
        SELECT r.id, r.short_name, COUNT(rs.stop_id) as stop_count
        FROM routes r
        LEFT JOIN route_stops rs ON r.id = rs.route_id
        GROUP BY r.id, r.short_name
    """)
    route_coverage = cursor.fetchall()
    summary['routes_with_less_than_2_stops'] = sum(1 for r in route_coverage if r[2] < 2)
    with open(os.path.join(reports_dir, "route_coverage.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Route ID", "Route Name", "Stop Count"])
        writer.writerows(route_coverage)

    # 6. Save JSON Summary
    summary_path = os.path.join(reports_dir, "validation_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=4)
        
    print(f"Validation complete! Reports generated in '{reports_dir}' directory.")
    print(json.dumps(summary, indent=4))

if __name__ == "__main__":
    generate_reports()
