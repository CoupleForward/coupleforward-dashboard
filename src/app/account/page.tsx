import Link from "next/link";
import { redirect } from "next/navigation";
import { BirthdaySetter } from "@/components/BirthdaySetter";
import { Card, CardLabel } from "@/components/Card";
import { ExportDataButton } from "@/components/ExportDataButton";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Sidebar } from "@/components/Sidebar";
import { SignOutButton } from "@/components/SignOutButton";
import { ArrowLeftIcon } from "@/components/icons";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AccountPage() {
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

  const self = ctx.members.find((m) => m.user_id === ctx.userId);
  const partnerMember =
    ctx.members.find((m) => m.user_id !== ctx.userId) ?? null;

  return (
    <div className="min-h-screen bg-bg text-cream">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            coupleName={coupleDisplayName(ctx)}
            togetherSince={ctx.couple.together_since}
            memberSince={ctx.couple.created_at}
            soloPartner={ctx.members.length < 2}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
            <div className="max-w-[560px]">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[12px] text-cream-dim hover:text-cream transition"
              >
                <ArrowLeftIcon className="size-3.5" />
                Dashboard
              </Link>

              <h1 className="mt-3 text-[22px] font-semibold text-cream">
                Account
              </h1>

              <Card className="mt-5">
                <CardLabel>Your couple</CardLabel>
                <div className="mt-3 space-y-2 text-[13px] text-cream-dim">
                  <div className="flex justify-between gap-4">
                    <span className="text-cream-mute">Members</span>
                    <span className="text-right">
                      {ctx.members
                        .map(
                          (m) =>
                            (m.display_name ?? "").split(" ")[0] || "Partner",
                        )
                        .join(" & ")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-cream-mute">Signed in as</span>
                    <span className="text-right break-all">{ctx.email}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-cream-mute">Together since</span>
                    <span>{fmtDate(ctx.couple.together_since)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-cream-mute">Members since</span>
                    <span>{fmtDate(ctx.couple.created_at)}</span>
                  </div>
                </div>
              </Card>

              <Card className="mt-4">
                <CardLabel>Your weeks</CardLabel>
                <p className="mt-3 text-[13px] text-cream-dim leading-relaxed">
                  Your birthday powers the 4,000 Weeks horizon: your weeks
                  lived, your weeks ahead, and the horizon you two share.
                </p>
                <div className="mt-4">
                  <BirthdaySetter
                    userId={ctx.userId}
                    initial={self?.birthday ?? null}
                    partnerName={
                      partnerMember
                        ? (partnerMember.display_name ?? "").split(" ")[0] ||
                          "Partner"
                        : null
                    }
                    partnerBirthday={partnerMember?.birthday ?? null}
                  />
                </div>
              </Card>

              <Card className="mt-4">
                <CardLabel>Your data</CardLabel>
                <p className="mt-3 text-[13px] text-cream-dim leading-relaxed">
                  Everything you write here belongs to the two of you: Huddle
                  answers, journal entries, ratings. Download a complete copy
                  any time.
                </p>
                <div className="mt-4">
                  <ExportDataButton coupleId={ctx.couple.id} />
                </div>
                <p className="mt-4 text-[12px] text-cream-mute leading-relaxed">
                  Want your data removed entirely? Ask us, from your account
                  email, and we will delete all of it. Deletion requests are
                  always honored.
                </p>
              </Card>

              <Card className="mt-4">
                <CardLabel>Session</CardLabel>
                <div className="mt-3">
                  <SignOutButton />
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <MobileNav active="account" />
    </div>
  );
}
