import { ActionButton } from "@/components/action-form";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setUserFlagAction } from "@/lib/actions";
import { formatDate } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getAdminUsers } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const generateMetadata = pageTitle("Users");

export default async function AdminUsersPage() {
  const t = await getT();
  const admin = await requireAdmin();
  const users = await getAdminUsers();

  return (
    <>
      <h1 className="text-3xl font-semibold">{t("Users")}</h1>
      <div className="overflow-x-auto rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("User")}</TableHead>
              <TableHead>{t("Phone")}</TableHead>
              <TableHead>{t("Member since")}</TableHead>
              <TableHead>{t("Listings / purchases")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
              <TableHead>{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell dir="ltr">{user.phone ?? "—"}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  {user._count.listings} / {user._count.purchases}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.suspended ? <Badge variant="destructive">{t("Suspended")}</Badge> : null}
                    {user.verifiedSeller ? <Badge>{t("Verified seller")}</Badge> : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <ActionButton
                      action={setUserFlagAction}
                      id={user.id}
                      fields={{ flag: "verifiedSeller", value: String(!user.verifiedSeller) }}
                      variant="outline"
                      size="sm"
                    >
                      {user.verifiedSeller ? t("Remove verification") : t("Verify")}
                    </ActionButton>
                    {user.id === admin.id ? null : (
                      <ActionButton
                        action={setUserFlagAction}
                        id={user.id}
                        fields={{ flag: "suspended", value: String(!user.suspended) }}
                        variant="ghost"
                        size="sm"
                      >
                        {user.suspended ? t("Unsuspend") : t("Suspend")}
                      </ActionButton>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
