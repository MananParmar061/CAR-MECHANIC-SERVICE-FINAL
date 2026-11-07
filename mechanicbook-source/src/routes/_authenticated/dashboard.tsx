import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getMyAccount, listMyBookings, updateBookingStatus } from "@/lib/bookings.functions";
import { STATUS_LABELS, formatRupees } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — MechanicBook" },
      {
        name: "description",
        content: "Track your car service bookings, statuses and estimates in one place.",
      },
      { property: "og:title", content: "Your Dashboard — MechanicBook" },
      { property: "og:description", content: "Live status for every booking you've made." },
    ],
  }),
  component: DashboardPage,
});

const NEXT_STATUS: Record<string, string> = {
  pending: "accepted",
  accepted: "on_the_way",
  on_the_way: "in_progress",
  in_progress: "completed",
};

function statusClass(status: string) {
  if (status === "completed") return "bg-success/15 text-success";
  if (status === "cancelled") return "bg-destructive/15 text-destructive";
  if (status === "pending") return "bg-secondary text-muted-foreground";
  return "bg-primary/15 text-primary";
}

function DashboardPage() {
  const account = useQuery({ queryKey: ["account"], queryFn: () => getMyAccount() });
  const bookings = useQuery({ queryKey: ["my-bookings"], queryFn: () => listMyBookings() });
  const queryClient = useQueryClient();

  const isMechanic = account.data?.roles.includes("mechanic") ?? false;

  const statusMutation = useMutation({
    mutationFn: (vars: { bookingId: string; status: string }) =>
      updateBookingStatus({
        data: { bookingId: vars.bookingId, status: vars.status as "accepted" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Could not update the status"),
  });

  const rows = bookings.data ?? [];
  const active = rows.filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const completed = rows.filter((b) => b.status === "completed");

  return (
    <div>
      <section className="hero-surface border-b border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-14 sm:px-6">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              {isMechanic ? "Mechanic dashboard" : "Your bookings"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {account.data?.profile?.full_name
                ? `Welcome back, ${account.data.profile.full_name}.`
                : "Welcome back."}{" "}
              {isMechanic
                ? "Manage the jobs assigned to you."
                : "Track every service from booking to completion."}
            </p>
          </div>
          {!isMechanic && (
            <Button variant="hero" size="xl" asChild>
              <Link to="/booking">New booking</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="section-py">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Active jobs", value: active.length },
              { label: "Completed", value: completed.length },
              { label: "Total bookings", value: rows.length },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6">
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { label: "All bookings", hint: "Full history & tracking", to: "/bookings" as const },
              { label: "My vehicles", hint: "Manage your garage", to: "/vehicles" as const },
              { label: "Profile", hint: "Name, phone & city", to: "/profile" as const },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="glass-card flex items-center justify-between p-5 transition-colors hover:border-primary/40"
              >
                <div>
                  <p className="font-display font-semibold">{link.label}</p>
                  <p className="text-sm text-muted-foreground">{link.hint}</p>
                </div>
                <ArrowRight className="size-4 text-primary" />
              </Link>
            ))}
          </div>

          <h2 className="mt-12 font-display text-2xl font-bold">
            {active.length > 0 ? "Active" : "No active jobs"}
          </h2>

          <div className="mt-6 space-y-4">
            {active.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                isMechanic={isMechanic}
                onAdvance={(status) => statusMutation.mutate({ bookingId: b.id, status })}
                pending={statusMutation.isPending}
              />
            ))}
            {active.length === 0 && !bookings.isLoading && (
              <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                {isMechanic ? (
                  "No jobs assigned to you yet."
                ) : (
                  <>
                    You haven't booked a service yet.{" "}
                    <Link to="/booking" className="text-primary hover:underline">
                      Book a mechanic
                    </Link>
                    .
                  </>
                )}
              </div>
            )}
          </div>

          {completed.length > 0 && (
            <>
              <h2 className="mt-14 font-display text-2xl font-bold">History</h2>
              <div className="mt-6 space-y-4">
                {completed.map((b) => (
                  <BookingCard key={b.id} booking={b} isMechanic={isMechanic} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

type BookingRow = Awaited<ReturnType<typeof listMyBookings>>[number];

function BookingCard({
  booking,
  isMechanic,
  onAdvance,
  pending,
}: {
  booking: BookingRow;
  isMechanic: boolean;
  onAdvance?: (status: string) => void;
  pending?: boolean;
}) {
  const next = NEXT_STATUS[booking.status];

  return (
    <article className="glass-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-lg font-semibold">
            <Link
              to="/bookings/$id"
              params={{ id: booking.id }}
              className="transition-colors hover:text-primary"
            >
              {booking.services?.name ?? "Service"}
            </Link>
          </h3>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(booking.status)}`}
          >
            {STATUS_LABELS[booking.status] ?? booking.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{booking.vehicle_label}</p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-primary" /> {booking.scheduled_date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" /> {booking.scheduled_time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" /> {booking.address}
          </span>
          {booking.mechanics && (
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-3.5 fill-primary text-primary" />
              {booking.mechanics.full_name} · {booking.mechanics.specialty}
            </span>
          )}
        </div>

        {booking.notes && (
          <p className="mt-3 text-sm text-muted-foreground">Notes: {booking.notes}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        <span className="font-display text-xl font-bold">
          {formatRupees(booking.price_estimate)}
        </span>
        {isMechanic && next && onAdvance && (
          <Button variant="hero" size="sm" disabled={pending} onClick={() => onAdvance(next)}>
            Mark {STATUS_LABELS[next]?.toLowerCase() ?? next}
          </Button>
        )}
        {!isMechanic && booking.status === "pending" && onAdvance && (
          <Button
            variant="heroOutline"
            size="sm"
            disabled={pending}
            onClick={() => onAdvance("cancelled")}
          >
            Cancel
          </Button>
        )}
        {!isMechanic && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/bookings/$id" params={{ id: booking.id }}>
              Track details
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
