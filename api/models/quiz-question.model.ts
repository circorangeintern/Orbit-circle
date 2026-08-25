import { pool } from '../config/db';

export interface QuizQuestionRecord {
  id: number;
  module: string;
  stage: string;
  pool: string;
  question_text: string;
  question_type: string;
  primary_trait_id: number | null;
  secondary_trait_id: number | null;
  career_tags: string[];
  priority_weight: number;
  status: string;
}

class QuizQuestion {
  static async findById(id: number) {
    const result = await pool.query('SELECT * FROM quiz_questions WHERE id = $1', [id]);
    return result.rows[0];
  }

  // fixed Pool A questions, same for every user, in a stable order
  static async findPoolA() {
    const result = await pool.query(
      `SELECT * FROM quiz_questions WHERE pool = 'A' AND status = 'active' ORDER BY id`
    );
    return result.rows;
  }

  // candidate pool for adaptive selection: everything not yet asked, in the given pool(s)
  static async findCandidates(pools: string[], excludeIds: number[]) {
    const result = await pool.query(
      `SELECT * FROM quiz_questions
       WHERE pool = ANY($1) AND status = 'active' AND NOT (id = ANY($2))`,
      [pools, excludeIds]
    );
    return result.rows;
  }

  static async countAvailableForCoverage() {
    // used by Coverage = Questions Answered / Questions Available
    const result = await pool.query(
      `SELECT COUNT(*) FROM quiz_questions WHERE status = 'active' AND pool IN ('A','B')`
    );
    return Number(result.rows[0].count);
  }
}

export default QuizQuestion;