'use client';

import  { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import colors from "@/lib/colors";
import { useConversations, useConversationMessages, useMarkRead, useSetArchived } from "@/hooks/conversation.hook";
import { useChatSocket, ChatMessage } from "@/hooks/useChatSocket";
import { useRouter } from "next/navigation";
import { getToken, useGetMe, useLogout } from "@/hooks/auth.hook";
import { LogoutButton } from "@/components/dashboard";

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.background || "#09051d"};
  color: ${colors.normalWhite || "#ffffff"};
`;

const Sidebar = styled.aside`
  width: 260px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media (max-width: 900px) { display: none; }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 36px;
`;

const NavItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: ${(p) => (p.$active ? "#ffffff" : colors.muted || "#94a3b8")};
  background: ${(p) => (p.$active ? colors.purpleSoft || "rgba(119,59,236,0.25)" : "transparent")};
  div { display: flex; align-items: center; gap: 12px; }
`;

const BadgeCount = styled.span`
  background: ${colors.buttonPurple || "#773bec"};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
`;

const SidebarFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
`;

const AvatarCircle = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${colors.buttonPurple || "#773bec"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex: none;
`;

const Main = styled.main`
  flex: 1;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MobileLogoutBtn = styled(LogoutButton)`
  display: none;
  @media (max-width: 900px) {
    display: flex;
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const SearchInput = styled.div`
  position: relative;
  width: 320px;
  @media (max-width: 600px) {
    width: 100%;
  }
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: #fff;
    outline: none;
    font-size: 13.5px;
  }
  svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${colors.muted || "#94a3b8"}; }
`;

const ChatGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
  @media (max-width: 1024px) { 
    grid-template-columns: 1fr; 
  }
`;

const ConversationsPanel = styled.div<{ $showOnMobile: boolean }>`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: 1024px) {
    display: ${(p) => (p.$showOnMobile ? "flex" : "none")};
  }
`;

const FilterTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 12px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  color: ${(p) => (p.$active ? "#fff" : colors.muted || "#94a3b8")};
  font-size: 14px;
  font-weight: ${(p) => (p.$active ? "700" : "500")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ConversationItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: ${(p) => (p.$selected ? "rgba(119, 59, 236, 0.2)" : "transparent")};
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.04); }
`;

const ChatDetails = styled.div`
  flex: 1;
  min-width: 0;
  h4 { margin: 0 0 4px; font-size: 14px; font-weight: 600; }
  p { margin: 0; font-size: 12px; color: ${colors.muted || "#94a3b8"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 11px;
  color: ${colors.muted || "#94a3b8"};
`;

const UnreadBadge = styled.span`
  background: ${colors.buttonPurple || "#773bec"};
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
`;

const ArchiveBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.muted || "#94a3b8"};
  font-size: 11px;
  cursor: pointer;
  margin-top: 4px;
  &:hover { color: #fff; }
`;

const ActiveChatPanel = styled.div<{ $showOnMobile: boolean }>`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  min-height: 0;

  @media (max-width: 1024px) {
    display: ${(p) => (p.$showOnMobile ? "flex" : "none")};
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const BackBtn = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  margin-right: 4px;

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MessagesArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
  flex: 1;
  overflow-y: auto;
`;

const DateDivider = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${colors.muted || "#94a3b8"};
`;

const Bubble = styled.div<{ $isSender?: boolean }>`
  max-width: 480px;
  padding: 14px 18px;
  border-radius: ${(p) => (p.$isSender ? "16px 16px 4px 16px" : "16px 16px 16px 4px")};
  background: ${(p) => (p.$isSender ? colors.buttonPurple || "#773bec" : "rgba(255, 255, 255, 0.08)")};
  align-self: ${(p) => (p.$isSender ? "flex-end" : "flex-start")};
  font-size: 13.5px;
  line-height: 1.5;
`;

const InputBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 16px;
  input { flex: 1; background: transparent; border: none; color: #fff; outline: none; font-size: 14px; }
`;

const IconBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.muted || "#94a3b8"};
  cursor: pointer;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

type FilterType = "all" | "unread" | "archived";

export default function MentorMessagesPage() {
  const { data: me } = useGetMe();
  const { data: convData } = useConversations();
  const conversations = convData?.conversations ?? [];

  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const markRead = useMarkRead();
  const setArchived = useSetArchived();
  const socket = useChatSocket();

  const { data: historyData } = useConversationMessages(selectedId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  useEffect(() => {
    if (historyData?.messages) setMessages(historyData.messages);
  }, [historyData]);

  useEffect(() => {
    if (!selectedId) return;
    socket.joinConversation(selectedId);
    const unsubscribe = socket.onNewMessage((msg) => {
      if (msg.conversation_id === selectedId) setMessages((prev) => [...prev, msg]);
    });
    markRead.mutate(selectedId);
    return () => {
      socket.leaveConversation(selectedId);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const myUserId = (() => {
    const token = getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1])).id as string;
    } catch {
      return null;
    }
  })();

  const filtered = useMemo(() => {
    let list = conversations;
    if (filter === "unread") list = list.filter((c) => c.unreadCount > 0 && !c.archived);
    else if (filter === "archived") list = list.filter((c) => c.archived);
    else list = list.filter((c) => !c.archived);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.student_name.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, filter, search]);

  const unreadCount = conversations.filter((c) => c.unreadCount > 0 && !c.archived).length;
  const allCount = conversations.filter((c) => !c.archived).length;

  const selected = conversations.find((c) => c.id === selectedId);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setShowChatMobile(true);
  };

  const handleBackToList = () => {
    setShowChatMobile(false);
  };

  const handleSend = () => {
    if (!selectedId || !draft.trim()) return;
    socket.sendMessage(selectedId, draft.trim());
    setDraft("");
  };

  return (
    <Layout>
      <Sidebar>
        <div>
          <div style={{ fontWeight: 700, fontSize: "20px" }}>CareerMap</div>
          <Nav>
            <NavItem $active>
              <div>Messages</div>
              <BadgeCount>{unreadCount}</BadgeCount>
            </NavItem>
          </Nav>
        </div>

        <SidebarFooter>
          <LogoutButton type="button" onClick={handleLogout} style={{ width: "100%" }}>
            Logout
          </LogoutButton>
          <UserProfile>
            <AvatarCircle>{me ? getInitials(me.full_name) : "--"}</AvatarCircle>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>{me?.full_name}</div>
          </UserProfile>
        </SidebarFooter>
      </Sidebar>

      <Main>
        <Header>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "24px" }}>Messages</h1>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>Stay connected and support your mentees</span>
          </div>

          <HeaderActions>
            <SearchInput>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input placeholder="Search mentees" value={search} onChange={(e) => setSearch(e.target.value)} />
            </SearchInput>

            <MobileLogoutBtn type="button" onClick={handleLogout}>
              Logout
            </MobileLogoutBtn>
          </HeaderActions>
        </Header>

        <ChatGrid>
          <ConversationsPanel $showOnMobile={!showChatMobile}>
            <FilterTabs>
              <Tab $active={filter === "all"} onClick={() => setFilter("all")}>
                All <BadgeCount>{allCount}</BadgeCount>
              </Tab>
              <Tab $active={filter === "unread"} onClick={() => setFilter("unread")}>
                Unread <BadgeCount>{unreadCount}</BadgeCount>
              </Tab>
              <Tab $active={filter === "archived"} onClick={() => setFilter("archived")}>Archived</Tab>
            </FilterTabs>

            {filtered.map((item) => {
              const isSelected = item.id === selectedId;
              const lastMessageText = isSelected && messages.length > 0
                ? messages[messages.length - 1].body
                : (item.last_message_body || "No messages yet");

              return (
                <ConversationItem key={item.id} $selected={isSelected} onClick={() => handleSelectConversation(item.id)}>
                  <AvatarCircle style={{ width: 38, height: 38, fontSize: 13 }}>
                    {getInitials(item.student_name)}
                  </AvatarCircle>
                  <ChatDetails>
                    <h4>{item.student_name}</h4>
                    <p>{lastMessageText}</p>
                  </ChatDetails>
                  <Meta>
                    <span>{formatTime(item.last_message_at)}</span>
                    {item.unreadCount > 0 && <UnreadBadge>{item.unreadCount}</UnreadBadge>}
                    <ArchiveBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        setArchived.mutate({ conversationId: item.id, archived: !item.archived });
                      }}
                    >
                      {item.archived ? "Unarchive" : "Archive"}
                    </ArchiveBtn>
                  </Meta>
                </ConversationItem>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: 20, color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
                No conversations here.
              </div>
            )}
          </ConversationsPanel>

          <ActiveChatPanel $showOnMobile={showChatMobile}>
            {selected ? (
              <>
                <ChatHeader>
                  <BackBtn type="button" onClick={handleBackToList} aria-label="Back to conversations">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </BackBtn>
                  <AvatarCircle>{getInitials(selected.student_name)}</AvatarCircle>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>{selected.student_name}</h3>
                    {selected.career_title && (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        Interested in {selected.career_title}
                      </span>
                    )}
                  </div>
                </ChatHeader>

                <MessagesArea ref={listRef}>
                  <DateDivider>Today</DateDivider>
                  {messages.map((msg) => (
                    <Bubble key={msg.id} $isSender={msg.sender_id === myUserId}>
                      {msg.body}
                    </Bubble>
                  ))}
                </MessagesArea>

                <InputBar>
                  <input
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <IconBtn style={{ color: "#773bec" }} onClick={handleSend} disabled={!draft.trim()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </IconBtn>
                </InputBar>
              </>
            ) : (
              <div style={{ margin: "auto", color: "#94a3b8" }}>Select a conversation</div>
            )}
          </ActiveChatPanel>
        </ChatGrid>
      </Main>
    </Layout>
  );
}