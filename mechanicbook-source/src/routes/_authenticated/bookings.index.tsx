import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/SiteLayout";
import { listMyBookings } from "@/lib/bookings.functions";
import { STATUS_LABELS, formatRupees } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/bookings/")({
  head: () => ({
    meta: [
      { title: "My Bookings — MechanicBook" },
      {
        name: "description",
        content: "All your car service bookings with live status, estimates and tracking.",
      },
      { property: "og:title", content: "My Bookings — MechanicBook" },
      { property: "og:description", content: "Track every service from booking to completion." },
    ],
  }),
  component: BookingsPage,
});

function statusClass(status: string) {
  if (status === "completed") return "bg-success/15 text-success";
  if (status === "cancelled") return "bg-destructive/15 text-destructive";
  if (status === "pending") return "bg-secondary text-muted-foreground";
  return "bg-primary/15 text-primary";
}

function BookingsPage() {
  const bookings = useQuery({ queryKey: ["my-bookings"], queryFn: () => listMyBookings() });

  return (
    <div>
      <section className="hero-surface border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">My bookings</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Every job, <span className="text-gradient">one timeline</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Open any booking to see its live status, your mechanic's details and the final review.
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6">
          {(bookings.data ?? []).map((b) => (
            <Link
              key={b.id}
              to="/bookings/$id"
              params={{ id: b.id }}
              className="glass-card flex flex-col gap-4 p-6 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-lg font-semibold">
                    {b.services?.name ?? "Service"}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(b.status)}`}
                  >
                    {STATUS_LABELS[b.status] ?? b.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{b.vehicle_label}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-primary" /> {b.scheduled_date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" /> {b.scheduled_time}
                  </span>
                  {b.mechanics && (
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="size-3.5 fill-primary text-primary" />
                      {b.mechanics.full_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="font-display text-xl font-bold">
                  {formatRupees(b.price_estimate)}
                </span>
                <ArrowRight className="size-4 text-primary" />
              </div>
            </Link>
          ))}

          {!bookings.isLoading && (bookings.data ?? []).length === 0 && (
            <div className="glass-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
              <Button variant="hero" size="xl" className="mt-6" asChild>
                <Link to="/booking">Book your first mechanic</Link>
              </Button>
            </div>
          )}

          {bookings.isLoading && (
            <div className="glass-card animate-pulse p-10 text-center text-sm text-muted-foreground">
              Loading your bookings…
            </div>
          )}

          <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-3">
              <BadgeCheck className="size-5 text-success" />
              <p className="text-sm text-muted-foreground">
                Manage your saved cars and personal details any time.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="heroOutline" size="sm" asChild>
                <Link to="/vehicles">My vehicles</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
            </div>
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> Tip: add your service address in the booking form so your
            mechanic arrives at the right place.
          </p>
        </div>
      </section>
    </div>
  );
}
