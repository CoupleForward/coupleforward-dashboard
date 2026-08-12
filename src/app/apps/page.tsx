import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Sidebar } from "@/components/Sidebar";
import { ExternalIcon } from "@/components/icons";
import { SHELF_APPS } from "@/lib/lab/apps";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";

export const dynamic = "force-dynamic";

// The open app shelf as a page — every member, every tool, no journey gate.
export default async function AppsPage() {
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

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
            <div className="max-w-[880px]">
              <h1 className="text-[22px] font-semibold text-cream">
                Your tools
              </h1>
              <p className="mt-1 text-[13px] text-cream-dim leading-relaxed max-w-[560px]">
                Everything in the Lab is yours to use, any time. Some tools
                open in their own space. Your membership travels with you.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {SHELF_APPS.map((app) => {
                  const Icon = app.icon;
                  const inner = (
                    <div className="flex items-start gap-3.5">
                      <div className="size-10 rounded-xl bg-gold-soft grid place-items-center text-gold shrink-0">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14.5px] font-medium text-cream">
                            {app.label}
                          </span>
                          {app.status === "soon" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-1.5 py-0.5 text-[9px] font-medium text-gold uppercase tracking-wide">
                              <span className="size-1 rounded-full bg-gold" />
                              Soon
                            </span>
                          ) : app.external ? (
                            <ExternalIcon className="size-3 text-cream-mute" />
                          ) : null}
                        </div>
                        <p className="mt-1 text-[12px] text-cream-dim leading-snug">
                          {app.description}
                        </p>
                      </div>
                    </div>
                  );

                  if (app.status === "live" && app.href) {
                    return app.external ? (
                      <a
                        key={app.key}
                        href={app.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Card className="h-full hover:border-gold/40 transition">
                          {inner}
                        </Card>
                      </a>
                    ) : (
                      <Link key={app.key} href={app.href} className="block">
                        <Card className="h-full hover:border-gold/40 transition">
                          {inner}
                        </Card>
                      </Link>
                    );
                  }
                  return (
                    <Card key={app.key} className="h-full opacity-70">
                      {inner}
                    </Card>
                  );
                })}
              </div>

              <p className="mt-6 text-[12px] text-cream-mute leading-relaxed max-w-[560px]">
                Tools marked “Soon” are not built yet. When they arrive, they
                arrive as real, working tools. Not before.
              </p>
            </div>
          </main>
        </div>
      </div>

      <MobileNav active="apps" />
    </div>
  );
}
