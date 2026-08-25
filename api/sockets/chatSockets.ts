// sockets/chatSocket.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import ConversationModel from '../models/conversation.model';
import MessageModel from '../models/message.model';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const onlineUsers = new Map<string, string>(); // userId -> socketId

//  CHANGE: Accept 'io' as an argument instead of 'httpServer'
export function setupChatSocket(io: SocketIOServer) {
  // Auth happens once, at connection time
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {

        return next(new Error('No auth token provided'));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      socket.userId = payload.id;

      next();
    } catch (error: any) {

      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    onlineUsers.set(userId, socket.id);
    io.emit('presence:online', { userId });


    socket.on('conversation:join', async (conversationId: string) => {
      const conversation = await ConversationModel.findById(conversationId);
      if (!conversation) return;
      const isParticipant =
        conversation.student_id === userId || conversation.mentor_user_id === userId;
      if (!isParticipant) return;
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: string; body: string }) => {
      try {

        // 1. Find the conversation
        const conversation = await ConversationModel.findById(data.conversationId);
        if (!conversation) {

          return socket.emit('message:error', 'Conversation not found');
        }

        // 2. Check if the user is a participant
        const isParticipant =
          conversation.student_id === userId || conversation.mentor_user_id === userId;
        if (!isParticipant) {

          return socket.emit('message:error', 'You are not a participant in this chat');
        }

        if (!data.body?.trim()) {

          return socket.emit('message:error', 'Message cannot be empty');
        }

        // 3. Attempt to create the message

        const message = await MessageModel.create({
          conversation_id: data.conversationId,
          sender_id: userId,
          body: data.body.trim()
        });

        // 4. Emit back to the room
        io.to(`conversation:${data.conversationId}`).emit('message:new', message);

      } catch (error) {
        socket.emit('message:error', 'Internal server error while sending message');
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('presence:offline', { userId });
    });
  });
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}