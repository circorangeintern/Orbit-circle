import { pool } from '../config/db';

export interface MentorParams {
  full_name: string;
  headline?: string;
  location?: string;
  years_experience?: number;
  specialty_tags?: string[];
  bio?: string;
  photo_url?: string;
}

class Mentor {
  static async create(mentor: MentorParams) {
    const { full_name, headline, location, years_experience, specialty_tags, bio, photo_url } = mentor;
    const query = `
      INSERT INTO mentors (full_name, headline, location, years_experience, specialty_tags, bio, photo_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      full_name, headline, location, years_experience, specialty_tags, bio, photo_url
    ]);
    return result.rows[0];
  }

  static async findById(id: string) {
    const result = await pool.query(
      'SELECT * FROM mentors WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0];
  }

  static async findByCareer(careerId: string) {
    // powers "Find a Mentor" on the Career Detail page
    const query = `
      SELECT m.* FROM career_mentors cm
      JOIN mentors m ON m.id = cm.mentor_id
      WHERE cm.career_id = $1 AND m.is_active = true
    `;
    const result = await pool.query(query, [careerId]);
    return result.rows;
  }

  static async linkToCareer(careerId: string, mentorId: string) {
    await pool.query(
      'INSERT INTO career_mentors (career_id, mentor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [careerId, mentorId]
    );
  }

  static async findAll(limit: number, offset: number) {
    const result = await pool.query(
      'SELECT * FROM mentors WHERE is_active = true ORDER BY rating_avg DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }
}

export default Mentor;