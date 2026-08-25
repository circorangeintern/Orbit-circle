import { Pool } from 'pg';
import 'dotenv/config';

// A Pool manages multiple reusable connections instead of opening
// a new one per query — much cheaper under real traffic.
export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// Call this once at startup to fail fast if the DB is unreachable,
// rather than finding out on the first incoming request.
export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1'); // cheap check the connection actually works
    client.release(); // return the connection to the pool, don't close it
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1); // no point running an API that can't reach its DB
  }
};