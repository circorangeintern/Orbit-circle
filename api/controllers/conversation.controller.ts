import ConversationModel from '../models/conversation.model';
import MessageModel from '../models/message.model';



import type { Request, Response } from 'express';

function getUserId(req: Request): string {
  return (req as any).user.id;
}

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') {
    const err: any = new Error(`Missing or invalid route parameter: ${name}`);
    err.status = 400;
    throw err;
  }
  return value;
}

async function assertParticipant(conversationId: string, userId: string) {
  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) {
    const err: any = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }
  const isMentorSide = conversation.mentor_user_id === userId;
  const isStudentSide = conversation.student_id === userId;
  if (!isMentorSide && !isStudentSide) {
    const err: any = new Error('You are not part of this conversation');
    err.status = 403;
    throw err;
  }
  return { conversation, isMentorSide };
}

// GET /conversations -- the inbox list, for either role
export const listConversations = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const conversations = await ConversationModel.findForUser(userId);

  const withUnread = await Promise.all(
    conversations.map(async (c) => {
      const isMentorSide = c.mentor_user_id === userId;
      const lastRead = isMentorSide ? c.mentor_last_read_at : c.student_last_read_at;
      const unreadCount = await MessageModel.countUnread(c.id, lastRead, userId);
      const archived = isMentorSide ? c.mentor_archived : c.student_archived;
      return { ...c, unreadCount, archived };
    })
  );

  res.status(200).json({ conversations: withUnread });
};

// POST /conversations -- mentee starts (or reopens) a thread with a mentor
export const startConversation = async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const { mentorId, careerId } = req.body;
  if (!mentorId) {
    return res.status(400).json({ message: 'mentorId is required' });
  }
  const conversation = await ConversationModel.findOrCreate(studentId, mentorId, careerId);
  res.status(200).json({ conversation });
};

// GET /conversations/:id/messages
export const getMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = getParam(req, 'id');
    await assertParticipant(conversationId, getUserId(req));
    const messages = await MessageModel.findByConversation(conversationId);
    res.status(200).json({ messages });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
};

// PATCH /conversations/:id/read
export const markRead = async (req: Request, res: Response) => {
  try {
    const conversationId = getParam(req, 'id');
    const userId = getUserId(req);
    const { isMentorSide } = await assertParticipant(conversationId, userId);
    await ConversationModel.markRead(conversationId, userId, isMentorSide);
    res.status(200).json({ message: 'Marked as read' });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
};

// PATCH /conversations/:id/archive
export const setArchived = async (req: Request, res: Response) => {
  try {
    const conversationId = getParam(req, 'id');
    const userId = getUserId(req);
    const { archived } = req.body;
    const { isMentorSide } = await assertParticipant(conversationId, userId);
    const updated = await ConversationModel.setArchived(conversationId, isMentorSide, !!archived);
    res.status(200).json({ conversation: updated });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
};