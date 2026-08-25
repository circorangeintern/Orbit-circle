import { pool } from '../config/db';

export interface UserParams {
  id: string;
  full_name: string;
  password_hash: string | null;
  email: string;
  role: 'student' | 'mentor';
  google_id?: string;
}

export interface UserRecord {
  id: string;
  full_name: string | null;
  email: string;
  created_at: Date;
  role: 'student' | 'mentor';
}

export interface UserAuthRecord extends UserRecord {
  password_hash: string;
}

class User {
  static async create(user: UserParams): Promise<UserRecord> {
    const { id, full_name, password_hash, email, role } = user;
    const query = `
        INSERT INTO users (id, full_name, password_hash, email, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, full_name, email, created_at, role
    `;
    try {
      const result = await pool.query(query, [id, full_name, password_hash, email, role]);
      return result.rows[0];
    } catch (err: any) {
      if (err.code === '23505') {
        throw new Error('Email already in use');
      }
      throw err;
    }
  }
  static async findById(id: string): Promise<UserRecord | undefined> {
    const query = `
        SELECT id, full_name, email, created_at, role
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  static async findByEmail(email: string): Promise<UserRecord | undefined> {
    const query = `
        SELECT id, full_name, email, created_at, role
        FROM users
        WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findAuthByEmail(email: string): Promise<UserAuthRecord | undefined> {
    const query = `
        SELECT id, full_name, email, password_hash, created_at, role
        FROM users
        WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findAuthById(id: string): Promise<UserAuthRecord | undefined> {
    const query = `
        SELECT id, full_name, email, password_hash, created_at, role
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(limit: number, offset: number) {
    const query = `
    SELECT id, full_name, email, created_at,role
    FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async update(id: string, full_name: string, email: string): Promise<UserRecord | undefined> {
    const query = `
        UPDATE users
        SET full_name = $1, email = $2
        WHERE id = $3
        RETURNING id, full_name, email, created_at, role
    `;
    const result = await pool.query(query, [full_name, email, id]);
    return result.rows[0];
  }
  static async updatePassword(id: string, password_hash: string): Promise<UserRecord | undefined> {
    const query = `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
        RETURNING id, full_name, email, created_at, role
    `;
    const result = await pool.query(query, [password_hash, id]);
    return result.rows[0];
  }
  static async delete(id: string): Promise<UserRecord | undefined> {
    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id, full_name, email, created_at, role
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateGoogleId(userId: string, googleId: string): Promise<void> {
    await pool.query(
      `UPDATE users SET google_id = $1 WHERE id = $2`,
      [googleId, userId]
    );
  }
}

export default User;
