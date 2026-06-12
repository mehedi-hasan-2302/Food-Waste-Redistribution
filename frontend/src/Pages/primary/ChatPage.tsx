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
    activeConversation,
    messages,
    isLoading,
    error,
    fetchConversations,
    fetchMessages,
    openConversationWithUser,
    sendMessage,
  } = useChatStore();

  const [userIdInput, setUserIdInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    if (token) {
      fetchConversations(token);
    }
  }, [fetchConversations, token]);

  const activeRecipientId = useMemo(() => {
    return activeConversation?.otherUser.id;
  }, [activeConversation]);

  const handleStartConversation = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const userId = Number(userIdInput);
    if (!Number.isInteger(userId) || userId <= 0) return;

    await openConversationWithUser(token, userId);
    setUserIdInput("");
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

          <form onSubmit={handleStartConversation} className="mb-5 flex gap-2">
            <Input
              type="number"
              min="1"
              value={userIdInput}
              onChange={(event) => setUserIdInput(event.target.value)}
              placeholder="User ID"
              className="bg-white"
            />
            <Button
              type="submit"
              className="bg-highlight text-white hover:bg-brand-green"
              disabled={isLoading}
            >
              Start
            </Button>
          </form>

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
                Select an existing chat or start one with a user ID.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatPage;
