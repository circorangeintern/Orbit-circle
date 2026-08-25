import { pool } from '../config/db';

class Trait {
  static async findAll() {
    const result = await pool.query('SELECT * FROM traits ORDER BY code');
    return result.rows;
  }

  static async findByCode(code: string) {
    const result = await pool.query('SELECT * FROM traits WHERE code = $1', [code]);
    return result.rows[0];
  }

  static async findById(id: number) {
    const result = await pool.query('SELECT * FROM traits WHERE id = $1', [id]);
    return result.rows[0];
  }
}

export default Trait;