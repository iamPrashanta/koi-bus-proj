import argparse
import sqlite3
import csv
import os

DB_PATH = os.path.join("assets", "data", "koibus.db")

def export_csv(table_name, out_path):
    print(f"Exporting table {table_name} to {out_path}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        # Get column names
        names = [description[0] for description in cursor.description]
        
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(names)
            writer.writerows(rows)
            
        print(f"Successfully exported {len(rows)} rows.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Koi Bus CSV Exporter")
    parser.add_argument("--table", required=True, help="Table to export")
    parser.add_argument("--out", required=True, help="Output CSV path")

    args = parser.parse_args()
    export_csv(args.table, args.out)
