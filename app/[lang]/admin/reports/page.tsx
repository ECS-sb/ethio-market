import { ActionButton } from "@/components/action-form";
import { LocaleLink } from "@/components/i18n-provider";
import { resolveContactAction, resolveReportAction } from "@/lib/actions";
import { formatDate, getPlatform, labelOf, reportReasons } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getAdminReports } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const generateMetadata = pageTitle("Reports");

export default async function AdminReportsPage() {
  const t = await getT();
  await requireAdmin();
  const { reports, contacts } = await getAdminReports();

  return (
    <>
      <h1 className="text-3xl font-semibold">{t("Reports")}</h1>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("Listing reports")}</h2>
        {reports.length === 0 ? (
          <p className="rounded-xl bg-card/70 p-6 text-center text-muted-foreground ring-1 ring-foreground/10">{t("No open reports.")}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reports.map((report) => (
              <li key={report.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
                <div className="flex min-w-0 flex-col gap-1 text-sm">
                  <LocaleLink href={`/accounts/${report.listing.id}`} className="font-semibold break-all hover:underline" dir="ltr">
                    {getPlatform(report.listing.platform)?.name} · @{report.listing.username}
                  </LocaleLink>
                  <span className="text-muted-foreground">
                    {t(labelOf(reportReasons, report.reason))} · {report.reporter.email} · {formatDate(report.createdAt)}
                  </span>
                </div>
                <ActionButton action={resolveReportAction} id={report.id} variant="outline">
                  {t("Mark resolved")}
                </ActionButton>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("Contact requests")}</h2>
        {contacts.length === 0 ? (
          <p className="rounded-xl bg-card/70 p-6 text-center text-muted-foreground ring-1 ring-foreground/10">{t("No open requests.")}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {contacts.map((contact) => (
              <li key={contact.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
                <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                  <span className="font-semibold break-all">
                    {contact.name} ({contact.email})
                  </span>
                  <span className="text-muted-foreground">{formatDate(contact.createdAt)}</span>
                  <p className="pt-2 break-words whitespace-pre-line">{contact.body}</p>
                </div>
                <ActionButton action={resolveContactAction} id={contact.id} variant="outline">
                  {t("Mark resolved")}
                </ActionButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
