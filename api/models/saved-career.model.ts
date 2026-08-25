import { pool } from '../config/db';

class SavedCareer {
  static async save(userId: string, careerId: string) {
    const result = await pool.query(
      `INSERT INTO saved_careers (user_id, career_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId, careerId]
    );
    return result.rows[0] ?? null; // null means it was already saved
  }

  static async unsave(userId: string, careerId: string) {
    const result = await pool.query(
      'DELETE FROM saved_careers WHERE user_id = $1 AND career_id = $2 RETURNING career_id',
      [userId, careerId]
    );
    return result.rows[0];
  }

  static async isSaved(userId: string, careerId: string) {
    const result = await pool.query(
      'SELECT EXISTS (SELECT 1 FROM saved_careers WHERE user_id = $1 AND career_id = $2) AS saved',
      [userId, careerId]
    );
    return result.rows[0].saved as boolean;
  }

  static async listForUser(userId: string) {
    const query = `
      SELECT c.*, sc.saved_at
      FROM saved_careers sc
      JOIN careers c ON c.id = sc.career_id
      WHERE sc.user_id = $1
      ORDER BY sc.saved_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

export default SavedCareer;