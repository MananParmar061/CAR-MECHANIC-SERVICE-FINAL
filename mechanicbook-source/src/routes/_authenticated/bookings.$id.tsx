import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Star,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getBooking, submitReview, updateBookingStatus } from "@/lib/bookings.functions";
import { STATUS_LABELS, formatRupees, serviceIcon } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  head: () => ({
    meta: [
      { title: "Booking Details — MechanicBook" },
      { name: "description", content: "Live status, timeline and review for this booking." },
      { property: "og:title", content: "Booking Details — MechanicBook" },
      { property: "og:description", content: "Track this job from booking to completion." },
    ],
  }),
  component: BookingDetailPage,
});

const STAGES = ["pending", "accepted", "on_the_way", "in_progress", "completed"] as const;

function BookingDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const booking = useQuery({ queryKey: ["booking", id], queryFn: () => getBooking({ data: { id } }) });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const cancelMutation = useMutation({
    mutationFn: () => updateBookingStatus({ data: { bookingId: id, status: "cancelled" as const } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Booking cancelled");
    },
    onError: () => toast.error("Could not cancel the booking"),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      submitReview({
        data: {
          bookingId: id,
          mechanicId: booking.data!.booking.mechanics!.id,
          rating,
          comment,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["mechanic-reviews"] });
      toast.success("Thanks! Your review is live.");
    },
    onError: () => toast.error("Could not submit the review"),
  });

  const data = booking.data;

  if (booking.isLoading) {
    return (
      <div className="section-py">
        <div className="glass-card mx-auto max-w-3xl animate-pulse p-10 text-center text-sm text-muted-foreground">
          Loading booking…
        </div>
      </div>
    );
  }

  if (booking.isError || !data) {
    return (
      <div className="section-py">
        <div className="glass-card mx-auto max-w-3xl p-10 text-center">
          <p className="text-sm text-muted-foreground">
            This booking doesn't exist or you don't have access to it.
          </p>
          <Button variant="hero" size="sm" className="mt-6" asChild>
            <Link to="/bookings">Back to my bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const b = data.booking;
  const ServiceIcon = serviceIcon(b.services?.icon ?? "wrench");
  const currentStage = STAGES.indexOf(b.status as (typeof STAGES)[number]);
  const isCancelled = b.status === "cancelled";
  const canReview = b.status === "completed" && !data.review;

  return (
    <div>
      <section className="hero-surface border-b border-border/60">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <Link
            to="/bookings"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All bookings
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10">
              <ServiceIcon className="size-5 text-primary" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold">{b.services?.name ?? "Service"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Booked {new Date(b.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {b.vehicle_label}
              </p>
            </div>
            <span
              className={`ml-auto rounded-full px-3 py-1.5 text-sm font-medium ${
                isCancelled
                  ? "bg-destructive/15 text-destructive"
                  : b.status === "completed"
                    ? "bg-success/15 text-success"
                    : "bg-primary/15 text-primary"
              }`}
            >
              {STATUS_LABELS[b.status] ?? b.status}
            </span>
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
          {/* Status timeline */}
          <div className="glass-card p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">Live status</h2>
            {isCancelled ? (
              <div className="mt-5 flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                <X className="size-4" /> This booking was cancelled.
              </div>
            ) : (
              <ol className="mt-6 space-y-0">
                {STAGES.map((stage, i) => {
                  const done = i < currentStage;
                  const active = i === currentStage;
                  return (
                    <li key={stage} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`grid size-8 shrink-0 place-items-center rounded-full text-xs ${
                            done
                              ? "bg-success text-success-foreground"
                              : active
                                ? "bg-primary text-primary-foreground glow-ring"
                                : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {done ? <Check className="size-4" /> : i + 1}
                        </span>
                        {i < STAGES.length - 1 && (
                          <span
                            className={`my-1 w-px flex-1 ${done ? "bg-success/50" : "bg-border"}`}
                          />
                        )}
                      </div>
                      <div className={`pb-6 ${i === STAGES.length - 1 ? "pb-0" : ""}`}>
                        <p
                          className={`text-sm font-medium ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {STATUS_LABELS[stage]}
                        </p>
                        {active && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Current status — updated live by your mechanic.
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Mechanic */}
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold">Your mechanic</h2>
              {b.mechanics ? (
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-primary/15 font-display font-bold text-primary">
                      {b.mechanics.full_name.charAt(0)}
                    </span>
                    <div>
                      <p className="flex items-center gap-1.5 font-medium">
                        {b.mechanics.full_name}
                        {b.mechanics.verified && <BadgeCheck className="size-4 text-success" />}
                      </p>
                      <p className="text-sm text-muted-foreground">{b.mechanics.specialty}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="size-3.5 fill-primary text-primary" /> {b.mechanics.rating} ·{" "}
                      {b.mechanics.city}
                    </span>
                  </div>
                  <Button variant="heroOutline" size="sm" className="mt-5" asChild>
                    <Link to="/mechanics/$id" params={{ id: b.mechanics.id }}>
                      View profile
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No mechanic assigned yet.</p>
              )}
            </div>

            {/* Schedule */}
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold">Schedule & location</h2>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" /> {b.scheduled_date}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 text-primary" /> {b.scheduled_time}
                </p>
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {b.address}
                </p>
              </div>
              {b.notes && (
                <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
                  “{b.notes}”
                </p>
              )}
              <p className="mt-4 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                Estimate:{" "}
                <span className="font-display text-base font-bold text-foreground">
                  {formatRupees(b.price_estimate)}
                </span>
              </p>
            </div>
          </div>

          {/* Vehicle */}
          {b.vehicles && (
            <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                  <Wrench className="size-4 text-primary" />
                </span>
                <div>
                  <p className="font-medium">
                    {b.vehicles.make} {b.vehicles.model} {b.vehicles.year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {b.vehicles.plate ?? "No plate saved"}
                    {b.vehicles.fuel ? ` · ${b.vehicles.fuel}` : ""}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/vehicles">Manage vehicles</Link>
              </Button>
            </div>
          )}

          {/* Actions */}
          {b.status === "pending" && (
            <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
              <p className="text-sm text-muted-foreground">
                Waiting for the mechanic to accept. You can still cancel free of charge.
              </p>
              <Button
                variant="heroOutline"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                {cancelMutation.isPending ? "Cancelling…" : "Cancel booking"}
              </Button>
            </div>
          )}

          {/* Review */}
          {canReview && (
            <div className="glass-card p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold">Rate this job</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                How did {b.mechanics?.full_name ?? "your mechanic"} do? Your review helps other car
                owners.
              </p>
              <div className="mt-4 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                    onClick={() => setRating(value)}
                    className="rounded-md p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-7 ${value <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                rows={3}
                maxLength={600}
                className="mt-4"
                placeholder="What went well? Anything to improve?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                variant="hero"
                className="mt-4"
                disabled={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate()}
              >
                {reviewMutation.isPending ? "Submitting…" : "Submit review"}
              </Button>
            </div>
          )}

          {data.review && (
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold">Your review</h2>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`size-4 ${value <= data.review!.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              {data.review.comment && (
                <p className="mt-3 text-sm text-muted-foreground">“{data.review.comment}”</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
