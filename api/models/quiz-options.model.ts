import { pool } from '../config/db';

class QuizAnswerOption {
  static async findByQuestion(questionId: number) {
    const result = await pool.query(
      'SELECT * FROM quiz_answer_options WHERE question_id = $1 ORDER BY id',
      [questionId]
    );
    return result.rows;
  }

  static async findById(id: number) {
    const result = await pool.query('SELECT * FROM quiz_answer_options WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByIds(ids: number[]) {
    const result = await pool.query(
      'SELECT * FROM quiz_answer_options WHERE id = ANY($1)',
      [ids]
    );
    return result.rows;
  }
}

export default QuizAnswerOption;