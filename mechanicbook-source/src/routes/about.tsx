import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/SiteLayout";
import { ABOUT_STATS, VALUES } from "@/lib/site-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MechanicBook — India's Trusted Mechanic Platform" },
      {
        name: "description",
        content:
          "Founded in 2020, MechanicBook connects 50,000+ car owners with 200+ certified mechanics across 50+ Indian cities.",
      },
      { property: "og:title", content: "About MechanicBook" },
      {
        property: "og:description",
        content: "Our story, our values and the standards every mechanic must meet.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About Us"
        title={
          <>
            Making car repair <span className="text-gradient">honest again</span>
          </>
        }
        subtitle="We started MechanicBook in 2020 after one too many surprise repair bills. Today we're India's most trusted way to find a mechanic you can rely on."
      />

      <section className="section-py">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Our story</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                MechanicBook began in a Mumbai garage in 2020. Our founders were tired of the same
                story every car owner knows: unclear diagnoses, shifting prices and no way to tell a
                great mechanic from a risky one.
              </p>
              <p>
                So we flipped the model. We verify every mechanic ourselves, publish their rates
                upfront, and let real customers rate the work. No commissions on parts, no padded
                labour hours.
              </p>
              <p>
                Five years later, 50,000+ customers across 50+ cities have booked through
                MechanicBook — and our mechanics average a 4.9 rating.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {ABOUT_STATS.map((s) => (
              <div key={s.label} className="glass-card p-6 text-center">
                <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py border-y border-border/60 bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold">What we stand for</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold">Join 50,000+ car owners</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Book your first service today and see the difference a verified mechanic makes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="xl" asChild>
              <Link to="/booking">Book a Mechanic</Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/mechanics">Browse Mechanics</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
