import Link from "next/link";
import { redirect } from "next/navigation";
import { MeditationPlayer } from "@/components/MeditationPlayer";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ArrowLeftIcon } from "@/components/icons";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";

export const dynamic = "force-dynamic";

export default async function MeditatePage() {
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

  return (
    <div className="min-h-screen bg-bg text-cream">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px]">
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            coupleName={coupleDisplayName(ctx)}
            togetherSince={ctx.couple.together_since}
            memberSince={ctx.couple.created_at}
            soloPartner={ctx.members.length < 2}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
            <div className="max-w-[520px] mx-auto">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[12px] text-cream-dim hover:text-cream transition"
              >
                <ArrowLeftIcon className="size-3.5" />
                Dashboard
              </Link>

              <h1 className="mt-3 text-[22px] font-semibold text-cream">
                Guided Meditations
              </h1>
              <p className="mt-1 mb-6 text-[13px] text-cream-dim leading-relaxed">
                Short practices for settling your system. Pick one and let it
                pace you. Recordings in Christian&apos;s voice are coming; the
                guided text works the same way.
              </p>

              <MeditationPlayer />
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
