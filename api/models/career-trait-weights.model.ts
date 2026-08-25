import { pool } from '../config/db';

class CareerTraitWeight {
  // full weight profile for one career -- used in career match score + information gain calc
  static async findByCareer(careerId: string) {
    const result = await pool.query(
      `SELECT ctw.*, t.code AS trait_code
       FROM career_trait_weights ctw
       JOIN traits t ON t.id = ctw.trait_id
       WHERE ctw.career_id = $1`,
      [careerId]
    );
    return result.rows;
  }

  // every career's weight for a single trait -- useful for spread/gain calculations
  static async findByTrait(traitId: number) {
    const result = await pool.query(
      'SELECT * FROM career_trait_weights WHERE trait_id = $1',
      [traitId]
    );
    return result.rows;
  }

  // the full table, shaped as { careerId: { traitCode: weight } } for in-memory scoring
  static async findAllAsMatrix() {
  const result = await pool.query(
    `SELECT ctw.career_id, t.code AS trait_code, ctw.weight
     FROM career_trait_weights ctw
     JOIN traits t ON t.id = ctw.trait_id`
  );
  const matrix: Record<string, Record<string, number>> = {};
  for (const row of result.rows) {
    if (!matrix[row.career_id]) {
      matrix[row.career_id] = {};
    }
    const careerWeights = matrix[row.career_id]!;
    careerWeights[row.trait_code] = Number(row.weight);
  }
  return matrix;
}
}


export default CareerTraitWeight;