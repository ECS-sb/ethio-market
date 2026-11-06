import Link from "next/link";
import { Brand } from "@/components/brand";
import { platforms } from "@/lib/catalog";

const groups = [
  {
    title: "ገበያ",
    links: [
      ...platforms.map((platform) => ({
        href: `/accounts?platform=${platform.id}`,
        label: platform.name,
      })),
      { href: "/accounts?special=1", label: "ልዩ የተጠቃሚ ስሞች" },
      { href: "/sold", label: "የተሸጡ" },
    ],
  },
  {
    title: "እርዳታ",
    links: [
      { href: "/how-it-works", label: "እንዴት ይሰራል" },
      { href: "/faq", label: "ተደጋጋሚ ጥያቄዎች" },
      { href: "/sell", label: "አካውንት ይሽጡ" },
      { href: "/sellers", label: "ምርጥ ሻጮች" },
      { href: "/contact", label: "ያግኙን" },
    ],
  },
  {
    title: "ኩባንያ",
    links: [
      { href: "/about", label: "ስለ እኛ" },
      { href: "/rules", label: "የገዢ እና የሻጭ ደንቦች" },
      { href: "/terms", label: "የአገልግሎት ውል" },
      { href: "/privacy", label: "የግላዊነት ፖሊሲ" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Brand />
          <p className="text-sm text-muted-foreground">የሶሻል ሚዲያ አካውንቶችን ለመግዛት እና ለመሸጥ የሚያስችል የኢትዮጵያ ገበያ።</p>
          <div className="flex flex-col gap-2 text-sm">
            <a href="https://ethiocomputer.school" className="w-fit text-muted-foreground transition-colors hover:text-primary">
              Ethio Computer School
            </a>
            <a href="https://ethiocshub.com" className="w-fit text-muted-foreground transition-colors hover:text-primary">
              Ethio CS Hub
            </a>
          </div>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
            <p className="text-sm font-semibold">{group.title}</p>
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="mx-auto w-full max-w-7xl border-t border-border px-6 py-6">
        <p className="text-xs text-muted-foreground">© Ethio Market</p>
      </div>
    </footer>
  );
}
