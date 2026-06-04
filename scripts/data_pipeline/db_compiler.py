import sqlite3
import os
import json
import csv
import uuid

def geohash_encode(latitude, longitude, precision=8):
    base32 = "0123456789bcdefghjkmnpqrstuvwxyz"
    lat_interval = (-90.0, 90.0)
    lon_interval = (-180.0, 180.0)
    geohash = []
    bits = [16, 8, 4, 2, 1]
    bit = 0
    ch = 0
    even = True
    while len(geohash) < precision:
        if even:
            mid = (lon_interval[0] + lon_interval[1]) / 2
            if longitude > mid:
                ch |= bits[bit]
                lon_interval = (mid, lon_interval[1])
            else:
                lon_interval = (lon_interval[0], mid)
        else:
            mid = (lat_interval[0] + lat_interval[1]) / 2
            if latitude > mid:
                ch |= bits[bit]
                lat_interval = (mid, lat_interval[1])
            else:
                lat_interval = (lat_interval[0], mid)
        even = not even
        if bit < 4:
            bit += 1
        else:
            geohash.append(base32[ch])
            bit = 0
            ch = 0
    return "".join(geohash)

def build_schema(cursor):
    print("Building schema...")
    schema = """
    CREATE TABLE metadata (
        data_version VARCHAR(20) PRIMARY KEY,
        osm_version VARCHAR(20),
        route_version VARCHAR(20),
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        stop_count INTEGER DEFAULT 0,
        route_count INTEGER DEFAULT 0,
        graph_edge_count INTEGER DEFAULT 0
    );

    CREATE TABLE stops (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        geohash VARCHAR(8) NOT NULL,
        district VARCHAR(100),
        subdivision VARCHAR(100),
        municipality VARCHAR(100),
        zone VARCHAR(100),
        amenities JSONB,
        dqs INTEGER DEFAULT 100
    );
    CREATE VIRTUAL TABLE stops_fts USING fts5(id, name);
    CREATE INDEX idx_stops_geohash ON stops(geohash);

    CREATE TABLE districts (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL
    );

    CREATE TABLE terminals (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        district_id VARCHAR(50) REFERENCES districts(id),
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE operators (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50)
    );

    CREATE TABLE routes (
        id VARCHAR(50) PRIMARY KEY,
        short_name VARCHAR(50) NOT NULL,
        long_name VARCHAR(255) NOT NULL,
        operator_id VARCHAR(50) REFERENCES operators(id),
        route_type INTEGER NOT NULL,
        color_code VARCHAR(7) DEFAULT '#1E88E5',
        polyline TEXT NOT NULL
    );

    CREATE TABLE route_versions (
        id VARCHAR(50) PRIMARY KEY,
        route_id VARCHAR(50) REFERENCES routes(id),
        valid_from DATE,
        valid_until DATE
    );

    CREATE TABLE route_stops (
        route_id VARCHAR(50) REFERENCES routes(id),
        stop_id VARCHAR(50) REFERENCES stops(id),
        stop_sequence INTEGER NOT NULL,
        distance_from_start DOUBLE PRECISION,
        PRIMARY KEY (route_id, stop_sequence)
    );

    CREATE TABLE graph_edges (
        from_stop_id VARCHAR(50) REFERENCES stops(id),
        to_stop_id VARCHAR(50) REFERENCES stops(id),
        route_id VARCHAR(50) REFERENCES routes(id),
        distance_meters DOUBLE PRECISION,
        estimated_minutes INTEGER,
        transfer_cost DOUBLE PRECISION DEFAULT 0.0,
        PRIMARY KEY (from_stop_id, to_stop_id, route_id)
    );

    CREATE TABLE trips (
        id VARCHAR(50) PRIMARY KEY,
        route_id VARCHAR(50) REFERENCES routes(id),
        departure_time TIME NOT NULL,
        arrival_time TIME NOT NULL,
        service_days VARCHAR(7)
    );

    CREATE TABLE fares (
        id VARCHAR(50) PRIMARY KEY,
        route_id VARCHAR(50) REFERENCES routes(id),
        source_stop_id VARCHAR(50) REFERENCES stops(id),
        target_stop_id VARCHAR(50) REFERENCES stops(id),
        price_inr DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE vehicles (
        id VARCHAR(50) PRIMARY KEY,
        registration_number VARCHAR(50) NOT NULL,
        operator_id VARCHAR(50) REFERENCES operators(id),
        capacity INTEGER
    );

    CREATE TABLE drivers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20)
    );

    CREATE TABLE live_positions (
        vehicle_id VARCHAR(50) PRIMARY KEY REFERENCES vehicles(id),
        route_id VARCHAR(50) REFERENCES routes(id),
        driver_id VARCHAR(50) REFERENCES drivers(id),
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        speed REAL,
        bearing REAL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        occupancy_tier INTEGER DEFAULT 1
    );

    CREATE TABLE occupancy_reports (
        route_id VARCHAR(50) REFERENCES routes(id),
        vehicle_id VARCHAR(50) REFERENCES vehicles(id),
        occupancy_level INTEGER NOT NULL,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE user_reports (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        stop_id VARCHAR(50) REFERENCES stops(id),
        route_id VARCHAR(50) REFERENCES routes(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'ACTIVE'
    );
    """
    cursor.executescript(schema)

def compile_database():
    print("Phase 0C: Database Compiler Started...")
    db_dir = os.path.join("assets", "data")
    raw_dir = os.path.join(db_dir, "raw")
    db_path = os.path.join(db_dir, "koibus.db")
    
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    build_schema(cursor)
    
    # Metadata insert moved to the end of the script to capture actual counts.
    
    # 2. Ingest OSM Stops
    osm_path = os.path.join(raw_dir, "osm_stops.json")
    added_stops = 0
    stop_name_to_id = {} # For resolving route_stops mapping
    
    if os.path.exists(osm_path):
        with open(osm_path, "r", encoding="utf-8") as f:
            elements = json.load(f)
            
        for el in elements:
            tags = el.get('tags', {})
            name = tags.get('name')
            if not name:
                name = tags.get('noname', 'Unnamed Bus Stop')
                
            lat = el.get('lat')
            lng = el.get('lon')
            if not lat or not lng:
                continue
                
            stop_id = str(el.get('id', uuid.uuid4()))
            geohash = geohash_encode(lat, lng)
            
            try:
                cursor.execute(
                    "INSERT INTO stops (id, name, lat, lng, geohash) VALUES (?, ?, ?, ?, ?)",
                    (stop_id, name, lat, lng, geohash)
                )
                cursor.execute(
                    "INSERT INTO stops_fts (id, name) VALUES (?, ?)",
                    (stop_id, name)
                )
                added_stops += 1
                stop_name_to_id[name.lower()] = stop_id
            except sqlite3.IntegrityError:
                continue
    print(f"Compiled {added_stops} stops into DB.")

    # 3. Ingest Routes and Operators
    routes_path = os.path.join(raw_dir, "routes.csv")
    operators = {}
    if os.path.exists(routes_path):
        with open(routes_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                operator_name = row['operator_name']
                if operator_name not in operators:
                    op_id = str(uuid.uuid4())
                    operators[operator_name] = op_id
                    cursor.execute("INSERT INTO operators (id, name, type) VALUES (?, ?, ?)", 
                                   (op_id, operator_name, row['operator_type']))
                
                cursor.execute("""
                    INSERT INTO routes (id, short_name, long_name, operator_id, route_type, color_code, polyline)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (row['id'], row['short_name'], row['long_name'], operators[operator_name], 
                      row['route_type'], row['color_code'], row['polyline']))
    
    # 4. Ingest Route Stops and Generate Graph Edges
    route_stops_path = os.path.join(raw_dir, "route_stops.csv")
    route_sequences = {} # route_id -> list of (stop_id, sequence)
    
    if os.path.exists(route_stops_path):
        with open(route_stops_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                s_name = row['stop_name'].lower()
                stop_id = stop_name_to_id.get(s_name)
                
                # If stop not found in OSM, create a mock stop for the graph
                if not stop_id:
                    stop_id = str(uuid.uuid4())
                    cursor.execute("INSERT INTO stops (id, name, lat, lng, geohash) VALUES (?, ?, ?, ?, ?)",
                                   (stop_id, row['stop_name'], 22.5726, 88.3639, "tgyuh5e3"))
                    cursor.execute("INSERT INTO stops_fts (id, name) VALUES (?, ?)", (stop_id, row['stop_name']))
                    stop_name_to_id[s_name] = stop_id
                
                cursor.execute("""
                    INSERT INTO route_stops (route_id, stop_id, stop_sequence, distance_from_start)
                    VALUES (?, ?, ?, ?)
                """, (row['route_id'], stop_id, row['stop_sequence'], row['distance_from_start']))
                
                if row['route_id'] not in route_sequences:
                    route_sequences[row['route_id']] = []
                route_sequences[row['route_id']].append({
                    "stop_id": stop_id,
                    "seq": int(row['stop_sequence'])
                })
                
    # 5. Generate Graph Edges based on sequences
    added_edges = 0
    for route_id, stops_list in route_sequences.items():
        stops_list.sort(key=lambda x: x['seq'])
        for i in range(len(stops_list) - 1):
            source = stops_list[i]['stop_id']
            target = stops_list[i+1]['stop_id']
            # Mock edge cost
            cursor.execute("""
                INSERT OR IGNORE INTO graph_edges (from_stop_id, to_stop_id, route_id, distance_meters, estimated_minutes, transfer_cost)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (source, target, route_id, 1500, 5, 0.0))
            added_edges += 1

    # Final. Update Metadata
    cursor.execute("SELECT COUNT(*) FROM stops")
    stop_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM routes")
    route_count = cursor.fetchone()[0]
    
    cursor.execute("""
        INSERT INTO metadata (data_version, osm_version, route_version, stop_count, route_count, graph_edge_count)
        VALUES (?, ?, ?, ?, ?, ?)
    """, ("2026.06.04", "OSM-2026", "CSV-1.0", stop_count, route_count, added_edges))

    conn.commit()
    conn.close()
    print("Phase 0C complete! koibus.db compiled successfully.")

if __name__ == "__main__":
    compile_database()
