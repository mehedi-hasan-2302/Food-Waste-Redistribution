import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

const ChatPage: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const {
    conversations,
    userSearchResults,
    activeConversation,
    messages,
    isSearchingUsers,
    error,
    searchUsers,
    fetchConversations,
    fetchMessages,
    openConversationWithUser,
    sendMessage,
  } = useChatStore();

  const [userSearchInput, setUserSearchInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    if (token) {
      fetchConversations(token);
    }
  }, [fetchConversations, token]);

  const activeRecipientId = useMemo(() => {
    return activeConversation?.otherUser.id;
  }, [activeConversation]);

  const handleSearchUsers = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    await searchUsers(token, userSearchInput);
  };

  const handleStartConversation = async (userId: number) => {
    if (!token) return;
    await openConversationWithUser(token, userId);
    setUserSearchInput("");
  };

  const handleSelectConversation = async (conversationId: number) => {
    if (!token) return;

    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) return;

    useChatStore.setState({ activeConversation: conversation });
    await fetchMessages(token, conversation.id);
  };

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !activeRecipientId || !messageInput.trim()) return;

    await sendMessage(token, activeRecipientId, messageInput);
    setMessageInput("");
  };

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-pale-mint px-4 py-8 font-sans text-dark-text">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-lg border border-dark-text/10 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-highlight" />
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>

          <form onSubmit={handleSearchUsers} className="mb-3 flex gap-2">
            <Input
              type="search"
              value={userSearchInput}
              onChange={(event) => setUserSearchInput(event.target.value)}
              placeholder="Search people"
              className="bg-white"
            />
            <Button
              type="submit"
              className="bg-highlight text-white hover:bg-brand-green"
              disabled={isSearchingUsers || userSearchInput.trim().length < 2}
            >
              Search
            </Button>
          </form>

          {userSearchResults.length > 0 && (
            <div className="mb-5 space-y-2 rounded-md border border-dark-text/10 bg-pale-mint/40 p-2">
              {userSearchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleStartConversation(user.id)}
                  className="w-full rounded-md bg-white px-3 py-2 text-left text-sm transition hover:bg-pale-mint"
                >
                  <span className="block font-medium">{user.username}</span>
                  <span className="block text-xs text-dark-text/60">
                    {user.email} · {user.role}
                  </span>
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="rounded-md border border-dashed border-dark-text/20 p-4 text-sm text-dark-text/70">
                No conversations yet.
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`w-full rounded-md border px-3 py-3 text-left transition ${
                    activeConversation?.id === conversation.id
                      ? "border-highlight bg-pale-mint"
                      : "border-dark-text/10 bg-white hover:bg-pale-mint/60"
                  }`}
                >
                  <p className="font-medium">{conversation.otherUser.username}</p>
                  <p className="text-xs uppercase tracking-wide text-dark-text/60">
                    {conversation.otherUser.role}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex min-h-[640px] flex-col rounded-lg border border-dark-text/10 bg-white shadow-sm">
          {activeConversation ? (
            <>
              <div className="border-b border-dark-text/10 px-5 py-4">
                <h2 className="text-lg font-semibold">
                  {activeConversation.otherUser.username}
                </h2>
                <p className="text-sm text-dark-text/60">
                  {activeConversation.otherUser.role}
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-dark-text/60">
                    Send the first message.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = String(message.senderId) === currentUser?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                            isMine
                              ? "bg-highlight text-white"
                              : "bg-pale-mint text-dark-text"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.message}
                          </p>
                          <p
                            className={`mt-1 text-[11px] ${
                              isMine ? "text-white/75" : "text-dark-text/50"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex gap-3 border-t border-dark-text/10 p-4"
              >
                <Textarea
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder="Write a message"
                  className="min-h-12 bg-white"
                />
                <Button
                  type="submit"
                  className="h-12 bg-highlight px-4 text-white hover:bg-brand-green"
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <MessageCircle className="mb-4 h-12 w-12 text-highlight" />
              <h2 className="text-xl font-semibold">Choose a conversation</h2>
              <p className="mt-2 max-w-md text-sm text-dark-text/65">
                Select an existing chat or search for a person to start one.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatPage;
