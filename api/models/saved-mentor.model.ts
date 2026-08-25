import { pool } from '../config/db';

class SavedMentor {
  static async save(userId: string, mentorId: string) {
    const result = await pool.query(
      `INSERT INTO saved_mentors (user_id, mentor_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId, mentorId]
    );
    return result.rows[0] ?? null;
  }

  static async unsave(userId: string, mentorId: string) {
    const result = await pool.query(
      'DELETE FROM saved_mentors WHERE user_id = $1 AND mentor_id = $2 RETURNING mentor_id',
      [userId, mentorId]
    );
    return result.rows[0];
  }

  static async isSaved(userId: string, mentorId: string) {
    const result = await pool.query(
      'SELECT EXISTS (SELECT 1 FROM saved_mentors WHERE user_id = $1 AND mentor_id = $2) AS saved',
      [userId, mentorId]
    );
    return result.rows[0].saved as boolean;
  }

  static async listForUser(userId: string) {
    const query = `
      SELECT m.*, sm.saved_at
      FROM saved_mentors sm
      JOIN mentors m ON m.id = sm.mentor_id
      WHERE sm.user_id = $1
      ORDER BY sm.saved_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

export default SavedMentor;