import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { AutoRefresh } from "@/components/auto-refresh";
import { Input } from "@/components/ui/input";
import { sendMessageAction } from "@/lib/actions";
import { getPlatform } from "@/lib/catalog";
import { getConversation } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "ውይይት" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/messages/${id}`);
  const conversation = await getConversation(id, user.id);
  if (!conversation) notFound();

  return (
    <>
      <AutoRefresh />
      <Link href="/dashboard/messages" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        ሁሉም መልዕክቶች
      </Link>
      <section aria-label={`ከ${conversation.otherName} ጋር ውይይት`} className="flex min-w-0 flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <header className="flex flex-col gap-1 border-b border-border pb-4">
          <h1 className="font-semibold">{conversation.otherName}</h1>
          <Link href={`/accounts/${conversation.listingId}`} className="w-fit text-xs text-muted-foreground hover:underline">
            <span dir="ltr">@{conversation.handle}</span> · {getPlatform(conversation.platform)?.name}
          </Link>
        </header>
        <div className="flex min-h-72 flex-col gap-2">
          {conversation.messages.length === 0 ? <p className="m-auto text-sm text-muted-foreground">ውይይቱን ይጀምሩ።</p> : null}
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
          <Input name="body" aria-label="መልዕክት" placeholder="መልዕክት ይጻፉ…" required maxLength={2000} autoComplete="off" />
          <SubmitButton size="icon" aria-label="ላክ" className="size-11">
            <SendIcon />
          </SubmitButton>
        </ActionForm>
        <p className="text-xs text-muted-foreground">የይለፍ ቃል ወይም የማረጋገጫ ኮድ በመልዕክት አይላኩ።</p>
      </section>
    </>
  );
}
