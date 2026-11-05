"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { conversations, getListing } from "@/lib/data";
import { cn } from "@/lib/utils";

export function MessagesPanel() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [threads, setThreads] = useState(() =>
    Object.fromEntries(conversations.map((conversation) => [conversation.id, conversation.messages]))
  );
  const [text, setText] = useState("");

  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];

  return (
    <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
      <ul className="flex flex-col gap-2 rounded-xl bg-card/70 p-2 ring-1 ring-foreground/10">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <button
              type="button"
              aria-current={conversation.id === activeId}
              onClick={() => setActiveId(conversation.id)}
              className={cn(
                "flex w-full flex-col gap-1 rounded-xl p-4 text-left text-sm transition-colors",
                conversation.id === activeId ? "bg-primary/15" : "hover:bg-muted"
              )}
            >
              <span className="font-medium">{conversation.name}</span>
              <span className="text-xs text-muted-foreground" dir="ltr">
                @{getListing(conversation.listingId)?.handle}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <section aria-label={`ከ${active.name} ጋር ውይይት`} className="flex min-w-0 flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <div className="flex min-h-72 flex-col gap-2">
          {threads[activeId].map((message, index) => (
            <p
              key={index}
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-2 text-sm",
                message.from === "me" ? "self-end bg-primary text-primary-foreground" : "self-start bg-secondary"
              )}
            >
              {message.text}
            </p>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const value = text.trim();
            if (!value) return;
            setThreads((current) => ({ ...current, [activeId]: [...current[activeId], { from: "me", text: value }] }));
            setText("");
          }}
        >
          <Input aria-label="መልዕክት" placeholder="መልዕክት ይጻፉ…" value={text} onChange={(event) => setText(event.target.value)} />
          <Button type="submit" size="icon" aria-label="ላክ" className="size-11" disabled={!text.trim()}>
            <SendIcon />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">ማሳያ፦ መልዕክቶች አይላኩም፤ ገጹ ሲታደስ ይጠፋሉ።</p>
      </section>
    </div>
  );
}
