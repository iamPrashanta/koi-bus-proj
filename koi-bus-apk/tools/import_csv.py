import argparse
import shutil
import os

DB_PATH = os.path.join("assets", "data", "koibus.db")

def import_csv(file_path, table_name):
    # Mock import for now
    print(f"Importing {file_path} into {table_name}...")
    print("This would read the CSV and perform UPSERTs on the database.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Koi Bus CSV Importer")
    parser.add_argument("--file", required=True, help="Path to CSV file")
    parser.add_argument("--table", required=True, help="Target table (e.g., stops, routes)")

    args = parser.parse_args()
    import_csv(args.file, args.table)
