import { pool } from '../config/db';

export interface ConversationRecord {
    id: string;
    student_id: string;
    mentor_id: string;
    career_id: string | null;
    student_archived: boolean;
    mentor_archived: boolean;
    student_last_read_at: Date | null;
    mentor_last_read_at: Date | null;
    created_at: Date;
    mentor_user_id: string | null; // joined in -- the login behind this mentor profile
    // Optional joined fields
    mentor_name?: string;
    mentor_headline?: string;
    mentor_photo_url?: string;
    career_title?: string;
    student_name?: string;
}

class ConversationModel {
    static async findById(id: string): Promise<ConversationRecord | undefined> {
        const result = await pool.query(
            `SELECT c.*, 
                    m.user_id AS mentor_user_id,
                    m.full_name AS mentor_name,
                    m.headline AS mentor_headline,
                    m.photo_url AS mentor_photo_url,
                    car.title AS career_title,
                    u.full_name AS student_name
             FROM conversations c
             JOIN mentors m ON m.id = c.mentor_id
             LEFT JOIN careers car ON car.id = c.career_id
             JOIN users u ON c.student_id = u.id
             WHERE c.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // idempotent: reopening an existing thread just returns it (matches the
    // UNIQUE(student_id, mentor_id) constraint)
    static async findOrCreate(studentId: string, mentorId: string, careerId?: string) {
        // Check if a conversation already exists (we only need the id)
        const existing = await pool.query(
            `SELECT id FROM conversations 
             WHERE student_id = $1 AND mentor_id = $2`,
            [studentId, mentorId]
        );
        if (existing.rows[0]) {
            return this.findById(existing.rows[0].id);
        }

        // Create new conversation
        const created = await pool.query(
            `INSERT INTO conversations (student_id, mentor_id, career_id)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [studentId, mentorId, careerId ?? null]
        );
        return this.findById(created.rows[0].id);
    }

    // every conversation involving this user, whether they're the student or
    // (via their linked mentor profile) the mentor
    static async findForUser(userId: string) {
        const result = await pool.query(
            `SELECT c.*, 
                    m.user_id AS mentor_user_id, 
                    m.full_name AS mentor_name,
                    m.headline AS mentor_headline, 
                    m.photo_url AS mentor_photo_url,
                    car.title AS career_title,
                    u.full_name AS student_name
             FROM conversations c
             JOIN mentors m ON m.id = c.mentor_id
             LEFT JOIN careers car ON car.id = c.career_id
             JOIN users u ON c.student_id = u.id
             WHERE c.student_id = $1 OR m.user_id = $1
             ORDER BY c.created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    static async markRead(conversationId: string, userId: string, isMentorSide: boolean) {
        const column = isMentorSide ? 'mentor_last_read_at' : 'student_last_read_at';
        await pool.query(`UPDATE conversations SET ${column} = now() WHERE id = $1`, [conversationId]);
    }

    static async setArchived(conversationId: string, isMentorSide: boolean, archived: boolean) {
        const column = isMentorSide ? 'mentor_archived' : 'student_archived';
        const result = await pool.query(
            `UPDATE conversations SET ${column} = $1 WHERE id = $2 RETURNING *`,
            [archived, conversationId]
        );
        return result.rows[0];
    }
}

export default ConversationModel;