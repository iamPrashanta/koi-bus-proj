import os
import csv

def generate_mock_csvs():
    output_dir = os.path.join("assets", "data", "raw")
    os.makedirs(output_dir, exist_ok=True)
    
    routes_path = os.path.join(output_dir, "routes.csv")
    route_stops_path = os.path.join(output_dir, "route_stops.csv")
    
    print("Phase 0B: Generating mock template CSVs for Transit Data...")
    
    # 1. Generate routes.csv
    with open(routes_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "short_name", "long_name", "operator_name", "operator_type", "route_type", "color_code", "polyline"])
        writer.writerow([
            "route_ac44", 
            "AC-44", 
            "Esplanade - Andul", 
            "WBTC", 
            "Government", 
            "0", 
            "#1E88E5", 
            "u{y~F~i|wO~@?jA?vB?hC?"  # Mock polyline
        ])
        writer.writerow([
            "route_s12", 
            "S-12", 
            "Howrah Station - Newtown", 
            "Private Syndicate", 
            "Private", 
            "0", 
            "#E53935", 
            "u{y~F~i|wO~@?jA?vB?hC?"
        ])
        
    # 2. Generate route_stops.csv (We will map these to OSM nodes during DB compilation or just mock them)
    # The stops refer to names which will be matched with OSM names
    with open(route_stops_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["route_id", "stop_name", "stop_sequence", "distance_from_start"])
        writer.writerow(["route_ac44", "Esplanade Bus Terminus", "1", "0.0"])
        writer.writerow(["route_ac44", "Howrah Station", "2", "3.5"])
        writer.writerow(["route_ac44", "Santragachi", "3", "10.2"])
        writer.writerow(["route_ac44", "Andul", "4", "15.0"])
        
        writer.writerow(["route_s12", "Howrah Station", "1", "0.0"])
        writer.writerow(["route_s12", "Kankurgachi", "2", "6.0"])
        writer.writerow(["route_s12", "Karunamoyee", "3", "10.0"])
        writer.writerow(["route_s12", "Newtown", "4", "14.5"])
        
    print(f"Phase 0B complete! Generated template CSVs at {output_dir}")

if __name__ == "__main__":
    generate_mock_csvs()
