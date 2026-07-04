import urllib.request
import json
import os

def fetch_osm_stops():
    print("Phase 0A: Fetching West Bengal bus stops & terminals from OpenStreetMap...")
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = """
    [out:json][timeout:90];
    area[name="West Bengal"]->.searchArea;
    (
      node["highway"="bus_stop"](area.searchArea);
      node["public_transport"="platform"]["bus"="yes"](area.searchArea);
      node["amenity"="bus_station"](area.searchArea);
    );
    out body;
    """
    
    req = urllib.request.Request(
        overpass_url, 
        data=query.encode('utf-8'), 
        headers={'User-Agent': 'KoiBusDataBuilder/1.0'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            elements = data.get('elements', [])
            print(f"Fetched {len(elements)} elements from OSM.")
            return elements
    except Exception as e:
        print(f"Error fetching data from Overpass API: {e}")
        return []

def run_phase_0a():
    elements = fetch_osm_stops()
    
    output_dir = os.path.join("assets", "data", "raw")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "osm_stops.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(elements, f, indent=2)
        
    print(f"Phase 0A complete! Saved to {output_path}")

if __name__ == "__main__":
    run_phase_0a()
