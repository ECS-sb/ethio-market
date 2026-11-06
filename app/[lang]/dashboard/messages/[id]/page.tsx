import { notFound } from "next/navigation";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { AutoRefresh } from "@/components/auto-refresh";
import { LocaleLink } from "@/components/i18n-provider";
import { Input } from "@/components/ui/input";
import { sendMessageAction } from "@/lib/actions";
import { getPlatform } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getConversation } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const generateMetadata = pageTitle("Conversation");

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const { id } = await params;
  const user = await requireUser(`/dashboard/messages/${id}`);
  const conversation = await getConversation(id, user.id);
  if (!conversation) notFound();

  return (
    <>
      <AutoRefresh />
      <LocaleLink href="/dashboard/messages" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        {t("All messages")}
      </LocaleLink>
      <section
        aria-label={t("Conversation with {name}", { name: conversation.otherName })}
        className="flex min-w-0 flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10"
      >
        <header className="flex flex-col gap-1 border-b border-border pb-4">
          <h1 className="font-semibold">{conversation.otherName}</h1>
          <LocaleLink href={`/accounts/${conversation.listingId}`} className="w-fit text-xs text-muted-foreground hover:underline">
            <span dir="ltr">@{conversation.handle}</span> · {getPlatform(conversation.platform)?.name}
          </LocaleLink>
        </header>
        <div className="flex min-h-72 flex-col gap-2">
          {conversation.messages.length === 0 ? <p className="m-auto text-sm text-muted-foreground">{t("Start the conversation.")}</p> : null}
          {conversation.messages.map((message) => (
            <p
              key={message.id}
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-2 text-sm break-words whitespace-pre-line",
                message.senderId === user.id ? "self-end bg-primary text-primary-foreground" : "self-start bg-secondary"
              )}
            >
              {message.body}
            </p>
          ))}
        </div>
        <ActionForm action={sendMessageAction} className="flex gap-2">
          <input type="hidden" name="conversationId" value={conversation.id} />
          <Input name="body" aria-label={t("Message")} placeholder={t("Write a message…")} required maxLength={2000} autoComplete="off" />
          <SubmitButton size="icon" aria-label={t("Send")} className="size-11">
            <SendIcon />
          </SubmitButton>
        </ActionForm>
        <p className="text-xs text-muted-foreground">{t("Don't send passwords or verification codes in messages.")}</p>
      </section>
    </>
  );
}
