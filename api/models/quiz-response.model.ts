import { pool } from '../config/db';

export interface QuizResponseParams {
  attempt_id: string;
  question_id: number;
  selected_option_ids?: number[] | undefined;
  ranking_order?: number[] | undefined;
  scale_value?: number | undefined;
  reflection_text?: string | undefined;
  trait_points_awarded?: Record<string, number> | undefined;
  is_skipped?: boolean | undefined;
}

class QuizResponse {
  static async create(response: QuizResponseParams) {
    const {
      attempt_id, question_id, selected_option_ids, ranking_order,
      scale_value, reflection_text, trait_points_awarded
    } = response;

    const result = await pool.query(
      `INSERT INTO quiz_responses
        (attempt_id, question_id, selected_option_ids, ranking_order, scale_value, reflection_text, trait_points_awarded)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        attempt_id, question_id,
        selected_option_ids ?? null,
        ranking_order ?? null,
        scale_value ?? null,
        reflection_text ?? null,
        trait_points_awarded ? JSON.stringify(trait_points_awarded) : null
      ]
    );
    return result.rows[0];
  }

  static async findByAttempt(attemptId: string) {
    const result = await pool.query(
      'SELECT * FROM quiz_responses WHERE attempt_id = $1 ORDER BY answered_at',
      [attemptId]
    );
    return result.rows;
  }

  // needed for the Consistency formula -- traits measured 2+ times
  static async findTraitHistoryForAttempt(attemptId: string) {
    const result = await pool.query(
      `SELECT qr.*, qq.primary_trait_id, qq.secondary_trait_id
       FROM quiz_responses qr
       JOIN quiz_questions qq ON qq.id = qr.question_id
       WHERE qr.attempt_id = $1`,
      [attemptId]
    );
    return result.rows;
  }
}

export default QuizResponse;