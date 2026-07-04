import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Map cache to avoid reopening DBs
const dbs: Record<string, Database.Database> = {};

function getDb(filename: string): Database.Database | null {
  if (dbs[filename]) return dbs[filename];

  const dbPath = path.join(__dirname, '../../../../data/maps', filename);
  if (!fs.existsSync(dbPath)) return null;

  try {
    const db = new Database(dbPath, { readonly: true });
    dbs[filename] = db;
    return db;
  } catch (err) {
    console.error(`Failed to open mbtiles DB at ${dbPath}:`, err);
    return null;
  }
}

export const getTile = (req: Request, res: Response) => {
  const { z, x, y } = req.params;
  
  // Try to use india.mbtiles or fallback to west_bengal.mbtiles or just koibus.mbtiles
  const possibleFiles = ['india.mbtiles', 'west_bengal.mbtiles', 'koibus.mbtiles'];
  let db: Database.Database | null = null;
  
  for (const file of possibleFiles) {
    db = getDb(file);
    if (db) break;
  }

  const transparentPixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  if (!db) {
    res.setHeader('Content-Type', 'image/png');
    return res.send(transparentPixel);
  }

  // MBTiles uses TMS coordinates (Y is flipped)
  const zoom = parseInt(z);
  const col = parseInt(x);
  const row = (Math.pow(2, zoom) - 1) - parseInt(y);

  try {
    const stmt = db.prepare('SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?');
    const rowObj = stmt.get(zoom, col, row) as { tile_data: Buffer } | undefined;

    if (!rowObj || !rowObj.tile_data) {
      res.setHeader('Content-Type', 'image/png');
      return res.send(transparentPixel);
    }

    res.setHeader('Content-Type', 'image/png'); // Can also be jpeg/pbf depending on the mbtiles
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    return res.send(rowObj.tile_data);
  } catch (err) {
    console.error('Tile query error:', err);
    return res.status(500).send('Database error');
  }
};
