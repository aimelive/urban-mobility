import sqlite3
import os
import csv

def create_database():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    db_file = os.path.join(script_dir, 'taxi_trips.db')
    csv_file = os.path.join(script_dir, 'data', 'train.csv')  # path to your CSV

    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    # Create table if not exists
    c.execute('''
        CREATE TABLE IF NOT EXISTS trips (
            id TEXT,
            vendor_id INTEGER,
            pickup_datetime TEXT,
            dropoff_datetime TEXT,
            passenger_count INTEGER,
            trip_distance REAL,
            pickup_longitude REAL,
            pickup_latitude REAL,
            dropoff_longitude REAL,
            dropoff_latitude REAL,
            fare_amount REAL,
            tip_amount REAL,
            trip_duration REAL,
            trip_speed REAL,
            fare_per_km REAL,
            idle_time REAL
        )
    ''')
    c.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_trips_id ON trips (id)')

    # Load CSV into database
    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            rows.append((
                row.get('id'),
                row.get('vendor_id'),
                row.get('pickup_datetime'),
                row.get('dropoff_datetime'),
                row.get('passenger_count'),
                row.get('trip_distance'),
                row.get('pickup_longitude'),
                row.get('pickup_latitude'),
                row.get('dropoff_longitude'),
                row.get('dropoff_latitude'),
                row.get('fare_amount'),
                row.get('tip_amount'),
                row.get('trip_duration'),
                row.get('trip_speed'),
                row.get('fare_per_km'),
                row.get('idle_time')
            ))

    c.executemany('INSERT OR IGNORE INTO trips VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', rows)

    conn.commit()
    conn.close()
    print("Database created and CSV data loaded successfully.")

if __name__ == '__main__':
    create_database()
