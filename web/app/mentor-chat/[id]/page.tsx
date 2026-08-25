'use client';

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import colors from "@/lib/colors";
import { DashboardShell, Card } from "@/components/dashboard";
import { useStartConversation, useConversationMessages, useMarkRead, ConversationSummary } from "@/hooks/conversation.hook";
import { useChatSocket, ChatMessage } from "@/hooks/useChatSocket";
import { getToken } from "@/hooks/auth.hook";


const TopHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const MentorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ChatAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(119, 59, 236, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.normalWhite};
  flex: none;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

const SubStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${colors.muted};
  span.dot { width: 6px; height: 6px; border-radius: 50%; background: #2ed573; }
`;

const FullChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  margin-top: 16px;
`;

const CareerBanner = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  margin-bottom: 24px;
  width: 100%;
  background: rgba(119, 59, 236, 0.12);
  @media (max-width: 860px) { padding: 14px 18px; }
`;

const BannerText = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
`;

const ViewProfileBtn = styled.button`
  padding: 10px 22px;
  border-radius: 10px;
  border: 1px solid rgba(119, 59, 236, 0.4);
  background: rgba(119, 59, 236, 0.25);
  color: #a77bf3;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: rgba(119, 59, 236, 0.4); color: ${colors.normalWhite}; }
`;

const DateDivider = styled.div`
  text-align: center;
  font-size: 13px;
  color: ${colors.muted};
  margin: 0 0 28px;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  flex: 1;
  overflow-y: auto;
`;

const MessageRow = styled.div<{ $isSender?: boolean }>`
  display: flex;
  justify-content: ${(p) => (p.$isSender ? "flex-end" : "flex-start")};
  gap: 12px;
  align-items: flex-start;
  width: 100%;
`;

const BubbleAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(119, 59, 236, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: ${colors.normalWhite};
  flex: none;
`;

const MessageBubble = styled.div<{ $isSender?: boolean }>`
  max-width: 480px;
  padding: 16px 20px;
  border-radius: ${(p) => (p.$isSender ? "16px 16px 4px 16px" : "16px 16px 16px 4px")};
  background: ${(p) => (p.$isSender ? colors.buttonPurple : "rgba(255, 255, 255, 0.08)")};
  color: ${colors.normalWhite};
  font-size: 14px;
  line-height: 1.6;
  @media (max-width: 860px) { max-width: 82%; }
`;

const TimeMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 6px;
`;

const InputBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 16px;
  border-radius: 16px;
  margin-top: 16px;

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: ${colors.normalWhite};
    outline: none;
    font-size: 14px;
  }
`;

const SendBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.buttonPurple};
  cursor: pointer;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function MentorChatPage() {
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;

  const startConversation = useStartConversation();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mentorInfo, setMentorInfo] = useState<{
    name: string;
    headline: string | null;
    photoUrl: string | null;
    careerTitle: string | null;
    mentorUserId: string | null;
  } | null>(null);

  const { data: historyData } = useConversationMessages(conversationId);
  const markRead = useMarkRead();
  const socket = useChatSocket();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // resolve (or create) the conversation for this mentor on mount
  useEffect(() => {
    startConversation.mutate(
      { mentorId },
      {
        onSuccess: (data) => {
          console.log('🔍 Full API response:', data);
          const c = data.conversation as ConversationSummary;
          setConversationId(c.id);
          setMentorInfo({
            name: c.mentor_name || 'Paul Dirisu',
            headline: c.mentor_headline || 'mentor',
            photoUrl: c.mentor_photo_url || '/image/Logo.png',
            careerTitle: c.career_title,
            mentorUserId: c.mentor_user_id
          });
        },
      onError: (error) => {
      console.error('Conversation API error:', error);
    }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId]);

  // seed history once fetched
  useEffect(() => {
    if (historyData?.messages) setMessages(historyData.messages);
  }, [historyData]);

  // join the socket room and listen for live messages
  useEffect(() => {
    if (!conversationId) return;
    socket.joinConversation(conversationId);
    const unsubscribe = socket.onNewMessage((msg) => {
      if (msg.conversation_id === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    markRead.mutate(conversationId);
    return () => {
      socket.leaveConversation(conversationId);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const myUserId = (() => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id as string;
    } catch {
      return null;
    }
  })();

  const handleSend = () => {
    if (!conversationId || !draft.trim()) return;
     console.log('🔵 Attempting to send message to:', conversationId, 'Content:', draft.trim());
    socket.sendMessage(conversationId, draft.trim());
    setDraft("");
  };

  if (!mentorInfo) {
    return (
      <DashboardShell heading={<Name>Loading chat...</Name>}>
        <div />
      </DashboardShell>
    );
  }

  const initials = getInitials(mentorInfo.name);
  const isOnline = socket.isOnline(mentorInfo.mentorUserId);

  return (
    <DashboardShell
      heading={
        <TopHeader>
          <MentorInfo>
            <ChatAvatar>{initials}</ChatAvatar>
            <HeaderText>
              <Name>{mentorInfo.name}</Name>
              <SubStatus>
                <span>{mentorInfo.headline}</span>
                {isOnline && (
                  <>
                    <span className="dot" />
                    <span style={{ color: "#2ed573" }}>Online</span>
                  </>
                )}
              </SubStatus>
            </HeaderText>
          </MentorInfo>
        </TopHeader>
      }
      topRight={<div />}
    >
      <FullChatContainer>
        {mentorInfo.careerTitle && (
          <CareerBanner>
            <BannerText>{mentorInfo.careerTitle}</BannerText>
            <ViewProfileBtn onClick={() => router.push(`/mentor/${mentorId}`)}>View profile</ViewProfileBtn>
          </CareerBanner>
        )}

        <DateDivider>Today</DateDivider>

        <MessageList ref={listRef}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === myUserId;
            return (
              <MessageRow key={msg.id} $isSender={isMe}>
                {!isMe && <BubbleAvatar>{initials}</BubbleAvatar>}
                <MessageBubble $isSender={isMe}>
                  {msg.body}
                  <TimeMeta>
                    <span>{formatTime(msg.created_at)}</span>
                  </TimeMeta>
                </MessageBubble>
              </MessageRow>
            );
          })}
        </MessageList>

        <InputBar>
          <input
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <SendBtn onClick={handleSend} disabled={!draft.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </SendBtn>
        </InputBar>
      </FullChatContainer>
    </DashboardShell>
  );
}