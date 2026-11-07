import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BadgeCheck, MapPin, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/SiteLayout";
import { listMechanics } from "@/lib/catalog.functions";
import { formatRupees } from "@/lib/site-data";

export const Route = createFileRoute("/mechanics")({
  head: () => ({
    meta: [
      { title: "Verified Car Mechanics Near You — MechanicBook" },
      {
        name: "description",
        content:
          "Browse 200+ background-verified car mechanics across India. Compare ratings, specialities, experience and hourly rates before booking.",
      },
      { property: "og:title", content: "Verified Car Mechanics Near You — MechanicBook" },
      {
        property: "og:description",
        content: "Compare ratings, specialities and rates from verified mechanics.",
      },
    ],
  }),
  component: MechanicsPage,
});

function MechanicsPage() {
  const mechanics = useQuery({ queryKey: ["mechanics"], queryFn: () => listMechanics() });
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");

  const cities = useMemo(() => {
    const set = new Set((mechanics.data ?? []).map((m) => m.city));
    return ["All", ...Array.from(set).sort()];
  }, [mechanics.data]);

  const filtered = (mechanics.data ?? []).filter((m) => {
    const matchesCity = city === "All" || m.city === city;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      m.full_name.toLowerCase().includes(q) ||
      m.specialty.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q);
    return matchesCity && matchesQuery;
  });

  return (
    <div>
      <PageHero
        eyebrow="Our Mechanics"
        title={
          <>
            Meet the <span className="text-gradient">verified experts</span>
          </>
        }
        subtitle="Every mechanic passes identity checks, a skill assessment and background screening before taking a single job."
      />

      <section className="section-py">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, speciality or city"
                className="pl-9"
                maxLength={80}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    city === c
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <article key={m.id} className="glass-card flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to="/mechanics/$id"
                      params={{ id: m.id }}
                      className="font-display text-lg font-semibold transition-colors hover:text-primary"
                    >
                      {m.full_name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{m.specialty}</p>
                  </div>
                  {m.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">
                      <BadgeCheck className="size-3.5" /> Verified
                    </span>
                  )}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-3.5 fill-primary text-primary" /> {m.rating} (
                    {m.review_count})
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5" /> {m.city}
                  </span>
                  <span className="text-muted-foreground">{m.jobs_done}+ jobs</span>
                  <span className="text-muted-foreground">{m.experience_years} yrs exp</span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                  <span className="font-display text-base font-bold text-primary">
                    {formatRupees(m.hourly_rate)}
                    <span className="text-xs font-normal text-muted-foreground">/hr</span>
                  </span>
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/booking" search={{ mechanic: m.id }}>
                      Book
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && !mechanics.isLoading && (
            <p className="mt-12 text-center text-sm text-muted-foreground">
              No mechanics match that search yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
