import { pool } from '../config/db';

export interface CareerParams {
  cluster_id?: number;
  title: string;
  why_this_summary?: string;
  description?: string;
  daily_tasks?: string[];
  key_skills?: string[];
  salary_local_min?: number;
  salary_local_max?: number;
  salary_local_currency?: string;
  salary_intl_min?: number;
  salary_intl_max?: number;
  salary_intl_currency?: string;
}

class Career {
  static async create(career: CareerParams) {
    const {
      cluster_id, title, why_this_summary, description, daily_tasks, key_skills,
      salary_local_min, salary_local_max, salary_local_currency,
      salary_intl_min, salary_intl_max, salary_intl_currency
    } = career;

    const query = `
      INSERT INTO careers (
        cluster_id, title, why_this_summary, description, daily_tasks, key_skills,
        salary_local_min, salary_local_max, salary_local_currency,
        salary_intl_min, salary_intl_max, salary_intl_currency
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `;
    const result = await pool.query(query, [
      cluster_id, title, why_this_summary, description, daily_tasks, key_skills,
      salary_local_min, salary_local_max, salary_local_currency ?? 'NGN',
      salary_intl_min, salary_intl_max, salary_intl_currency ?? 'USD'
    ]);
    return result.rows[0];
  }

  static async findById(id: string) {
    const result = await pool.query('SELECT * FROM careers WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll(limit: number, offset: number) {
    const result = await pool.query(
      'SELECT * FROM careers ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async findByCluster(clusterId: number) {
    const result = await pool.query('SELECT * FROM careers WHERE cluster_id = $1', [clusterId]);
    return result.rows;
  }

  static async findByIds(ids: string[]) {
    // used for turning a quiz attempt's final_recommended_careers array into full career objects
    const result = await pool.query('SELECT * FROM careers WHERE id = ANY($1)', [ids]);
    return result.rows;
  }

  static async delete(id: string) {
    const result = await pool.query('DELETE FROM careers WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default Career;