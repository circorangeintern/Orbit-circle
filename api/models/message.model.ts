import { pool } from '../config/db';

export interface MessageParams {
  conversation_id: string;
  sender_id: string;
  body: string;
}

class MessageModel {
  static async create(params: MessageParams) {
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.conversation_id, params.sender_id, params.body]
    );
    return result.rows[0];
  }

  static async findByConversation(conversationId: string, limit = 100) {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [conversationId, limit]
    );
    return result.rows;
  }

  static async countUnread(conversationId: string, sinceTimestamp: Date | null, excludingSenderId: string) {
    const result = await pool.query(
      `SELECT COUNT(*) FROM messages
       WHERE conversation_id = $1
         AND sender_id != $2
         AND ($3::timestamptz IS NULL OR created_at > $3)`,
      [conversationId, excludingSenderId, sinceTimestamp]
    );
    return Number(result.rows[0].count);
  }
}

export default MessageModel;