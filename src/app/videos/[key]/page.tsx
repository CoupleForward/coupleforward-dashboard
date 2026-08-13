import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ArrowLeftIcon } from "@/components/icons";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";
import { embedUrl, fmtDuration, videoByKey } from "@/lib/lab/videos";

export const dynamic = "force-dynamic";

// The watch page: one video, full width, nothing competing with it.
export default async function WatchPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const video = videoByKey(key);
  if (!video) notFound();

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
            <div className="mx-auto max-w-[960px]">
              <Link
                href="/videos"
                className="inline-flex items-center gap-1.5 text-[12px] text-cream-dim hover:text-cream transition"
              >
                <ArrowLeftIcon className="size-3.5" />
                Video Library
              </Link>

              <div className="mt-3 relative aspect-video overflow-hidden rounded-xl border border-line-soft/70 bg-black">
                <iframe
                  src={embedUrl(video)}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <h1 className="mt-4 text-[20px] sm:text-[24px] font-semibold text-cream leading-tight">
                {video.title}
              </h1>
              <p className="mt-1 text-[12px] text-cream-mute">
                {fmtDuration(video.durationSec)} · {video.category} · with
                Christian
              </p>
              <p className="mt-3 max-w-[640px] text-[13px] text-cream-dim leading-relaxed">
                {video.description}
              </p>
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
