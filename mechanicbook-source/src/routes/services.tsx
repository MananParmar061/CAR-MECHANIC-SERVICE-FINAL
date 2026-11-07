import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/SiteLayout";
import { listServices } from "@/lib/catalog.functions";
import { formatRupees, serviceIcon } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Car Repair & Maintenance Services — MechanicBook" },
      {
        name: "description",
        content:
          "Engine repair, brakes, AC service, electrical, oil changes, tyres and roadside assistance — with upfront prices from verified mechanics.",
      },
      { property: "og:title", content: "Car Repair & Maintenance Services — MechanicBook" },
      {
        property: "og:description",
        content: "Transparent, fixed-from pricing on every car service we offer.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const services = useQuery({ queryKey: ["services"], queryFn: () => listServices() });

  return (
    <div>
      <PageHero
        eyebrow="Our Services"
        title={
          <>
            Expert care for <span className="text-gradient">every part</span> of your car
          </>
        }
        subtitle="Fixed starting prices, certified specialists and honest diagnostics. Pick a service and we'll match you with the right mechanic."
      />

      <section className="section-py">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(services.data ?? []).map((service) => {
              const Icon = serviceIcon(service.icon ?? "wrench");
              return (
                <div
                  key={service.id}
                  className="glass-card flex flex-col p-6 transition-colors hover:border-primary/40"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <h2 className="mt-5 font-display text-lg font-semibold">{service.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-sm">
                    <span className="font-semibold text-primary">
                      From {formatRupees(service.price_from)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" /> {service.duration}
                    </span>
                  </div>
                  <Button variant="heroOutline" size="sm" className="mt-4" asChild>
                    <Link to="/booking" search={{ service: service.id }}>
                      Book this service
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="glass-card mt-14 p-8 text-center">
            <h2 className="font-display text-2xl font-bold">Not sure what's wrong?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Describe the symptoms during booking and a specialist will diagnose it before any work
              starts — you approve the estimate first.
            </p>
            <Button variant="hero" size="xl" className="mt-6" asChild>
              <Link to="/booking">
                Start a booking <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
