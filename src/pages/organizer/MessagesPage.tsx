import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Avatar, Button, EmptyState, ErrorState, Icon, Skeleton, Spinner } from '@/components/ui';
import { useDebounce, useQuery } from '@/hooks';
import { messageService } from '@/services';
import { useToast } from '@/store';
import { cn } from '@/utils/cn';
import { formatRelativeTime, formatTime } from '@/utils/format';

/**
 * Mesajlar ekranı — iki panelli düzen.
 * Solda konuşma listesi (arama destekli), sağda seçili konuşmanın akışı.
 * Mobilde tek panel gösterilir; konuşma seçilince akışa geçilir.
 */
export function MessagesPage() {
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  const debouncedSearch = useDebounce(search);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationsFetcher = useCallback(
    () => messageService.conversations(debouncedSearch),
    [debouncedSearch],
  );
  const conversations = useQuery(conversationsFetcher);

  const messagesFetcher = useCallback(
    () => messageService.messages(activeId as string),
    [activeId],
  );
  const messages = useQuery(messagesFetcher, { enabled: Boolean(activeId) });

  // İlk konuşmayı otomatik seç.
  useEffect(() => {
    if (!activeId && conversations.data?.length) {
      setActiveId(conversations.data[0].id);
    }
  }, [conversations.data, activeId]);

  // Yeni mesajda en alta kaydır.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.data]);

  const activeConversation = conversations.data?.find((item) => item.id === activeId) ?? null;

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId) return;

    setIsSending(true);
    try {
      const sent = await messageService.send(activeId, body);
      messages.setData((prev) => [...(prev ?? []), sent]);
      setDraft('');
      conversations.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mesaj gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full md:h-screen">
      {/* --------------------------- Konuşma listesi --------------------------- */}
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest md:w-80 lg:w-96',
          activeId && 'hidden md:flex',
        )}
      >
        <div className="border-b border-outline-variant p-4">
          <h1 className="mb-4 font-headline-sm text-headline-sm text-on-surface">Mesajlar</h1>
          <div className="flex items-center rounded-lg border border-outline-variant bg-surface px-3 focus-within:border-primary-container">
            <Icon name="search" size={20} className="mr-2 text-secondary" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kişi veya şirket ara..."
              aria-label="Konuşmalarda ara"
              className="w-full border-none bg-transparent py-2.5 font-body-md text-body-md focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {conversations.isLoading && (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {conversations.error && !conversations.isLoading && (
            <div className="p-4">
              <ErrorState message={conversations.error.message} onRetry={conversations.refetch} />
            </div>
          )}

          {conversations.data?.length === 0 && !conversations.isLoading && (
            <p className="p-8 text-center font-body-md text-body-md text-secondary">
              {search ? 'Aramanızla eşleşen konuşma yok.' : 'Henüz mesajınız yok.'}
            </p>
          )}

          {conversations.data?.map((conversation) => {
            const isActive = conversation.id === activeId;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={cn(
                  'flex w-full items-start gap-3 border-b border-outline-variant p-4 text-left transition-colors',
                  isActive ? 'bg-surface-container-low' : 'hover:bg-surface-container-low',
                )}
              >
                <Avatar
                  name={conversation.participantName}
                  src={conversation.participantAvatarUrl}
                  size={40}
                  online={conversation.online}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="truncate font-label-md text-label-md text-on-surface">
                      {conversation.participantName}
                    </h2>
                    <span className="shrink-0 font-label-sm text-label-sm text-secondary">
                      {formatRelativeTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="truncate font-body-md text-body-md text-secondary">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-1.5 font-label-sm text-label-sm text-on-primary">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ------------------------------ Sohbet akışı ------------------------------ */}
      <section
        className={cn('flex min-w-0 flex-1 flex-col bg-background', !activeId && 'hidden md:flex')}
      >
        {!activeConversation ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState
              icon="forum"
              title="Bir konuşma seçin"
              description="Soldaki listeden bir sponsor veya organizatör seçerek yazışmaya başlayın."
              className="border-none bg-transparent"
            />
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 py-3 md:px-6">
              <button
                type="button"
                aria-label="Listeye dön"
                onClick={() => setActiveId(null)}
                className="rounded-lg p-2 text-secondary hover:bg-surface-container-low md:hidden"
              >
                <Icon name="arrow_back" size={20} />
              </button>
              <Avatar
                name={activeConversation.participantName}
                src={activeConversation.participantAvatarUrl}
                size={40}
                online={activeConversation.online}
              />
              <div className="min-w-0">
                <h2 className="truncate font-headline-sm text-headline-sm text-on-surface">
                  {activeConversation.participantName}
                </h2>
                <p className="font-label-sm text-label-sm text-secondary">
                  {activeConversation.online ? 'Çevrimiçi' : 'Çevrimdışı'}
                </p>
              </div>
            </header>

            <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
              {messages.isLoading && (
                <div className="flex justify-center py-8">
                  <Spinner className="text-primary-container" />
                </div>
              )}

              {messages.error && !messages.isLoading && (
                <ErrorState message={messages.error.message} onRetry={messages.refetch} />
              )}

              {messages.data?.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-3',
                      message.isMine
                        ? 'rounded-br-sm bg-primary-container text-on-primary'
                        : 'rounded-bl-sm border border-outline-variant bg-surface-container-lowest text-on-surface',
                    )}
                  >
                    <p className="font-body-md text-body-md">{message.body}</p>
                    <p
                      className={cn(
                        'mt-1 text-right font-label-sm text-label-sm',
                        message.isMine ? 'text-primary-fixed-dim' : 'text-secondary',
                      )}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-end gap-3 border-t border-outline-variant bg-surface-container-lowest p-4 md:px-6"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(e as unknown as FormEvent);
                  }
                }}
                rows={1}
                placeholder="Mesajınızı yazın... (Enter ile gönder)"
                aria-label="Mesaj"
                className="max-h-32 flex-1 resize-none rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
              />
              <Button
                type="submit"
                isLoading={isSending}
                disabled={!draft.trim()}
                leadingIcon="send"
              >
                Gönder
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
