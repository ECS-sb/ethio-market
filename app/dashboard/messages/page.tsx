import type { Metadata } from "next";
import Link from "next/link";
import { getPlatform } from "@/lib/catalog";
import { getConversations } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "መልዕክቶች" };

export default async function MessagesPage() {
  const user = await requireUser("/dashboard/messages");
  const conversations = await getConversations(user.id);

  return (
    <>
      <h1 className="text-3xl font-semibold">መልዕክቶች</h1>
      {conversations.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">ገና ውይይት የለም።</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/dashboard/messages/${conversation.id}`}
                className="flex flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:ring-primary/60"
              >
                <span className="font-semibold">{conversation.otherName}</span>
                <span className="text-xs text-muted-foreground">
                  <span dir="ltr">@{conversation.handle}</span> · {getPlatform(conversation.platform)?.name}
                </span>
                {conversation.lastMessage ? <span className="truncate text-sm text-muted-foreground">{conversation.lastMessage}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
