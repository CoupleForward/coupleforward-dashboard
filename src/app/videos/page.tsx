import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { PlayIcon } from "@/components/icons";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";
import {
  FEATURED_VIDEO,
  fmtDuration,
  thumbUrl,
  videoRows,
} from "@/lib/lab/videos";

export const dynamic = "force-dynamic";

// The Video Library. Netflix-shaped: a billboard up top, then horizontal
// rows by category. Rows are registry-driven (src/lib/lab/videos.ts) —
// every video shown is real and watchable, nothing is a teaser tile.
export default async function VideosPage() {
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

  const featured = FEATURED_VIDEO;
  const rows = videoRows();

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

          <main className="flex-1 pb-24 lg:pb-10">
            {/* Billboard */}
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbUrl(featured, 1280, 720)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent" />

              <div className="relative px-4 sm:px-6 lg:px-10 pt-24 sm:pt-36 lg:pt-44 pb-6 sm:pb-10">
                <div className="max-w-[560px]">
                  <div className="text-[10px] font-semibold tracking-[0.24em] uppercase text-gold">
                    Featured
                  </div>
                  <h1 className="mt-2 text-[26px] sm:text-[36px] font-semibold leading-[1.05] text-cream">
                    {featured.title}
                  </h1>
                  <p className="mt-2 text-[12px] sm:text-[13px] text-cream-dim">
                    {fmtDuration(featured.durationSec)} · {featured.category} ·
                    with Christian
                  </p>
                  <p className="mt-2.5 hidden sm:block text-[13px] text-cream-dim leading-relaxed">
                    {featured.description}
                  </p>
                  <Link
                    href={`/videos/${featured.key}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold text-[#1a1a1a] pl-4 pr-6 py-2.5 text-[13.5px] font-semibold hover:bg-gold-bright transition"
                  >
                    <PlayIcon className="size-4" />
                    Play
                  </Link>
                </div>
              </div>
            </div>

            {/* Category rows */}
            <div className="mt-6 sm:mt-8 space-y-7 sm:space-y-9">
              {rows.map((row) => (
                <section key={row.category}>
                  <h2 className="px-4 sm:px-6 lg:px-10 text-[13.5px] font-semibold tracking-wide text-cream">
                    {row.category}
                  </h2>
                  <div className="mt-2.5 flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 lg:px-10 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {row.videos.map((v) => (
                      <Link
                        key={v.key}
                        href={`/videos/${v.key}`}
                        className="group shrink-0 w-[220px] sm:w-[280px] snap-start"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-lg border border-line-soft/70 bg-card">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbUrl(v, 640, 360)}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] tabular-nums text-cream">
                            {fmtDuration(v.durationSec)}
                          </span>
                          <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                            <span className="grid size-11 place-items-center rounded-full bg-gold/90 text-[#1a1a1a]">
                              <PlayIcon className="size-4.5 ml-0.5" />
                            </span>
                          </span>
                        </div>
                        <div className="mt-1.5 text-[12.5px] font-medium text-cream leading-snug">
                          {v.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}

              <p className="px-4 sm:px-6 lg:px-10 text-[11.5px] text-cream-mute leading-relaxed">
                Every video here is real and watchable. New teachings land in
                these rows as Christian records them.
              </p>
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
