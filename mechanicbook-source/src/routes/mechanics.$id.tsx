import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMechanic, listMechanicReviews } from "@/lib/catalog.functions";
import { formatRupees } from "@/lib/site-data";

type MechanicLoaderArgs = {
  params: { id: string };
  context: { queryClient: QueryClient };
};

const loadMechanic = async ({ params, context }: MechanicLoaderArgs) => {
  const mechanic = await context.queryClient.ensureQueryData({
    queryKey: ["mechanic", params.id],
    queryFn: () => getMechanic({ data: { id: params.id } }),
  });
  if (!mechanic) throw notFound();
  return { mechanic };
};

export const Route = createFileRoute("/mechanics/$id")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.mechanic
          ? `${loaderData.mechanic.full_name} — Verified Car Mechanic — MechanicBook`
          : "Mechanic Profile — MechanicBook",
      },
      {
        name: "description",
        content:
          "Verified car mechanic profile with ratings, experience, hourly rate and customer reviews.",
      },
      {
        property: "og:title",
        content: loaderData?.mechanic
          ? `${loaderData.mechanic.full_name} — Verified Car Mechanic`
          : "Mechanic Profile — MechanicBook",
      },
      {
        property: "og:description",
        content: "Background-verified mechanic with transparent rates and live job tracking.",
      },
    ],
  }),
  loader: loadMechanic,
  component: MechanicDetailPage,
});

function MechanicDetailPage() {
  const { mechanic } = Route.useLoaderData();
  const reviews = useQuery({
    queryKey: ["mechanic-reviews", mechanic.id],
    queryFn: () => listMechanicReviews({ data: { mechanicId: mechanic.id } }),
  });

  return (
    <div>
      <section className="hero-surface border-b border-border/60">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <Link
            to="/mechanics"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All mechanics
          </Link>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-primary/15 font-display text-3xl font-bold text-primary">
              {mechanic.full_name.charAt(0)}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold sm:text-4xl">{mechanic.full_name}</h1>
                {mechanic.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                    <BadgeCheck className="size-3.5" /> Verified
                  </span>
                )}
                {!mechanic.available && (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Currently unavailable
                  </span>
                )}
              </div>
              <p className="mt-2 text-muted-foreground">
                {mechanic.specialty} · <MapPin className="mb-0.5 inline size-3.5" /> {mechanic.city}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i <= Math.round(mechanic.rating)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </span>
                <span className="text-sm font-medium">{mechanic.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({mechanic.review_count} reviews)
                </span>
              </div>
            </div>
            <div className="shrink-0">
              {mechanic.available ? (
                <Button variant="hero" size="xl" asChild>
                  <Link to="/booking" search={{ mechanic: mechanic.id }}>
                    Book {mechanic.full_name.split(" ")[0]} <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="heroOutline" size="xl" disabled>
                  Unavailable
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[
              { label: "Jobs completed", value: `${mechanic.jobs_done}+` },
              { label: "Experience", value: `${mechanic.experience_years} yrs` },
              { label: "Hourly rate", value: formatRupees(mechanic.hourly_rate) },
              { label: "Response", value: "~30 min" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5">
                <p className="font-display text-2xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="glass-card p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">About</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{mechanic.bio}</p>
            </div>

            <div className="glass-card p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">Customer reviews</h2>
              <div className="mt-5 space-y-4">
                {(reviews.data ?? []).map((review) => (
                  <div key={review.id} className="rounded-xl border border-border/70 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                          <CircleCheck className="size-4 text-success" />
                        </span>
                        <span className="text-sm font-medium">Verified customer</span>
                      </div>
                      <span className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i <= review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        “{review.comment}”
                      </p>
                    )}
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3" />
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
                {!reviews.isLoading && (reviews.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No written reviews yet — be the first to leave one after your job.
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold">Booking includes</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Background-verified professional",
                  "Upfront estimate before any work",
                  "Live status tracking",
                  "Free cancellation while pending",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" /> {item}
                  </li>
                ))}
              </ul>
              {mechanic.available && (
                <Button variant="hero" size="xl" className="mt-6 w-full" asChild>
                  <Link to="/booking" search={{ mechanic: mechanic.id }}>
                    Book now
                  </Link>
                </Button>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
