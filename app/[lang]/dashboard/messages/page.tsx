import { LocaleLink } from "@/components/i18n-provider";
import { getPlatform } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getConversations } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const generateMetadata = pageTitle("Messages");

export default async function MessagesPage() {
  const t = await getT();
  const user = await requireUser("/dashboard/messages");
  const conversations = await getConversations(user.id);

  return (
    <>
      <h1 className="text-3xl font-semibold">{t("Messages")}</h1>
      {conversations.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">{t("No conversations yet.")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <LocaleLink
                href={`/dashboard/messages/${conversation.id}`}
                className="flex flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:ring-primary/60"
              >
                <span className="font-semibold">{conversation.otherName}</span>
                <span className="text-xs text-muted-foreground">
                  <span dir="ltr">@{conversation.handle}</span> · {getPlatform(conversation.platform)?.name}
                </span>
                {conversation.lastMessage ? <span className="truncate text-sm text-muted-foreground">{conversation.lastMessage}</span> : null}
              </LocaleLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
