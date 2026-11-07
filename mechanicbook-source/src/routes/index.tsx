import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listMechanics, listServices } from "@/lib/catalog.functions";
import {
  HOW_IT_WORKS,
  STATS,
  TESTIMONIALS,
  formatRupees,
  serviceIcon,
} from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MechanicBook — Book Verified Car Mechanics Online in India" },
      {
        name: "description",
        content:
          "Your car deserves expert care. Book background-verified mechanics in 50+ cities with transparent pricing and live job tracking.",
      },
      { property: "og:title", content: "MechanicBook — Your Car Deserves Expert Care" },
      {
        property: "og:description",
        content: "200+ verified mechanics online. Book in under 2 minutes.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const services = useQuery({ queryKey: ["services"], queryFn: () => listServices() });
  const mechanics = useQuery({ queryKey: ["mechanics"], queryFn: () => listMechanics() });

  return (
    <div>
      {/* Hero */}
      <section className="hero-surface relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="size-2 animate-pulse rounded-full bg-success" />
              200+ Verified Mechanics Online
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              Your Car Deserves <span className="text-gradient">Expert Care</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Book background-verified mechanics near you in minutes. Transparent pricing, live job
              tracking and a 100% satisfaction guarantee — across 50+ Indian cities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/booking">
                  Book a Mechanic <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Verified professionals
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 text-primary" /> Same-day service
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="size-4 text-primary" /> Upfront pricing
              </span>
            </div>
          </div>

          {/* Booking confirmed card */}
          <div className="relative">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-success/15">
                  <CalendarCheck className="size-5 text-success" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold">Booking Confirmed</p>
                  <p className="text-xs text-muted-foreground">Brake pad replacement · Today</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Rajesh Kumar</p>
                    <p className="text-xs text-muted-foreground">Brake & Suspension Specialist</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <Star className="size-3 fill-current" /> 4.9
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" /> Mumbai
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" /> 10:30 AM
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {["Mechanic accepted", "On the way", "Service in progress"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3 text-sm">
                    <span
                      className={`size-2.5 rounded-full ${i === 2 ? "bg-muted" : "bg-success"}`}
                    />
                    <span className={i === 2 ? "text-muted-foreground" : ""}>{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
                <span className="text-xs text-muted-foreground">Estimated total</span>
                <span className="font-display text-lg font-bold">{formatRupees(2400)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="section-py">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Every service your car needs
            </h2>
            <p className="mt-4 text-muted-foreground">
              From routine oil changes to complex engine diagnostics — handled by specialists with
              the right tools.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(services.data ?? []).slice(0, 6).map((service) => {
              const Icon = serviceIcon(service.icon ?? "wrench");
              return (
                <div key={service.id} className="glass-card p-6 transition-colors hover:border-primary/40">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{service.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">
                      From {formatRupees(service.price_from)}
                    </span>
                    <span className="text-muted-foreground">{service.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <Button variant="heroOutline" asChild>
              <Link to="/services">
                View all services <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-py border-y border-border/60 bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="glass-card p-6">
                <span className="font-display text-3xl font-bold text-primary/40">{step.step}</span>
                <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top mechanics */}
      <section className="section-py">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Top-rated mechanics</h2>
              <p className="mt-3 text-muted-foreground">
                Background-verified, skill-assessed and rated by real customers.
              </p>
            </div>
            <Button variant="heroOutline" asChild>
              <Link to="/mechanics">See all mechanics</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(mechanics.data ?? []).slice(0, 3).map((m) => (
              <div key={m.id} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{m.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{m.specialty}</p>
                  </div>
                  {m.verified && <BadgeCheck className="size-5 text-primary" />}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-foreground">
                    <Star className="size-3.5 fill-primary text-primary" /> {m.rating}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {m.city}
                  </span>
                  <span>{m.jobs_done}+ jobs</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {m.experience_years} yrs experience · {formatRupees(m.hourly_rate)}/hr
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-py border-t border-border/60 bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Loved by car owners</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card p-6">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{t.quote}”</p>
                <p className="mt-5 text-sm font-semibold">
                  {t.name} <span className="text-muted-foreground">· {t.city}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-py">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ready to get your car sorted?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Book a verified mechanic in under two minutes. No calls, no haggling.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="xl" asChild>
              <Link to="/booking">Book Now</Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
