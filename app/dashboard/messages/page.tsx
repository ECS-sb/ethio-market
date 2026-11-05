import type { Metadata } from "next";
import { MessagesPanel } from "@/components/messages-panel";

export const metadata: Metadata = { title: "መልዕክቶች" };

export default function MessagesPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">መልዕክቶች</h1>
      <MessagesPanel />
    </>
  );
}
