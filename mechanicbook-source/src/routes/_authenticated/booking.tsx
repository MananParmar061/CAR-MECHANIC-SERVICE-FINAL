import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BadgeCheck, Check, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listMechanics, listServices } from "@/lib/catalog.functions";
import { createBooking } from "@/lib/bookings.functions";
import { TIME_SLOTS, formatRupees, serviceIcon } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/booking")({
  head: () => ({
    meta: [
      { title: "Book a Mechanic — MechanicBook" },
      {
        name: "description",
        content:
          "Pick a service, choose a verified mechanic, add your car details and confirm your booking in under two minutes.",
      },
      { property: "og:title", content: "Book a Mechanic — MechanicBook" },
      { property: "og:description", content: "Three steps to a confirmed car service booking." },
    ],
  }),
  validateSearch: (
    search: Record<string, unknown>,
  ): { service?: string | undefined; mechanic?: string | undefined } => ({
    service: typeof search["service"] === "string" ? search["service"] : undefined,
    mechanic: typeof search["mechanic"] === "string" ? search["mechanic"] : undefined,
  }),
  component: BookingPage,
});

function BookingPage() {
  const preselect = Route.useSearch();
  const services = useQuery({ queryKey: ["services"], queryFn: () => listServices() });
  const mechanics = useQuery({ queryKey: ["mechanics"], queryFn: () => listMechanics() });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(preselect.service ?? null);
  const [mechanicId, setMechanicId] = useState<string | null>(preselect.mechanic ?? null);
  const [details, setDetails] = useState({
    make: "",
    model: "",
    year: String(new Date().getFullYear()),
    plate: "",
    scheduledDate: "",
    scheduledTime: TIME_SLOTS[0]!,
    address: "",
    notes: "",
  });

  const service = useMemo(
    () => (services.data ?? []).find((s) => s.id === serviceId) ?? null,
    [services.data, serviceId],
  );
  const mechanic = useMemo(
    () => (mechanics.data ?? []).find((m) => m.id === mechanicId) ?? null,
    [mechanics.data, mechanicId],
  );

  const estimate = (service?.price_from ?? 0) + (mechanic?.hourly_rate ?? 0);

  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
        data: {
          mechanicId: mechanicId!,
          serviceId: serviceId!,
          make: details.make,
          model: details.model,
          year: Number(details.year),
          plate: details.plate,
          scheduledDate: details.scheduledDate,
          scheduledTime: details.scheduledTime,
          address: details.address,
          notes: details.notes,
          priceEstimate: estimate,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Booking confirmed! Your mechanic will respond shortly.");
      navigate({ to: "/dashboard" });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not create the booking"),
  });

  const steps = ["Service", "Mechanic", "Details"];

  return (
    <div>
      <section className="hero-surface border-b border-border/60">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Book a mechanic</h1>
          <p className="mt-3 text-muted-foreground">
            Three quick steps. You'll see the estimate before you confirm.
          </p>

          <div className="mt-8 flex items-center gap-3">
            {steps.map((label, i) => {
              const index = i + 1;
              const done = step > index;
              return (
                <div key={label} className="flex flex-1 items-center gap-3">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                      done
                        ? "bg-success text-success-foreground"
                        : step === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-4" /> : index}
                  </span>
                  <span
                    className={`text-sm ${step === index ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {label}
                  </span>
                  {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(services.data ?? []).map((s) => {
                const Icon = serviceIcon(s.icon ?? "wrench");
                const selected = serviceId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setServiceId(s.id);
                      setStep(preselect.mechanic ? 3 : 2);
                    }}
                    className={`glass-card p-5 text-left transition-colors ${
                      selected ? "border-primary" : "hover:border-primary/40"
                    }`}
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </span>
                    <h2 className="mt-4 font-display text-base font-semibold">{s.name}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
                    <p className="mt-3 text-sm font-semibold text-primary">
                      From {formatRupees(s.price_from)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(mechanics.data ?? [])
                  .filter((m) => m.available)
                  .map((m) => {
                    const selected = mechanicId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMechanicId(m.id);
                          setStep(3);
                        }}
                        className={`glass-card p-5 text-left transition-colors ${
                          selected ? "border-primary" : "hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="font-display text-base font-semibold">{m.full_name}</h2>
                            <p className="text-sm text-muted-foreground">{m.specialty}</p>
                          </div>
                          {m.verified && <BadgeCheck className="size-4 text-primary" />}
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1 text-foreground">
                            <Star className="size-3.5 fill-primary text-primary" /> {m.rating}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" /> {m.city}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-primary">
                          {formatRupees(m.hourly_rate)}/hr
                        </p>
                      </button>
                    );
                  })}
              </div>
              <Button variant="ghost" className="mt-6" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          )}

          {step === 3 && (
            <form
              className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="glass-card space-y-5 p-6 sm:p-8">
                <h2 className="font-display text-xl font-semibold">Vehicle & schedule</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      required
                      maxLength={60}
                      placeholder="Maruti Suzuki"
                      value={details.make}
                      onChange={(e) => setDetails({ ...details, make: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      required
                      maxLength={60}
                      placeholder="Swift VXi"
                      value={details.model}
                      onChange={(e) => setDetails({ ...details, model: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      required
                      min={1980}
                      max={2030}
                      value={details.year}
                      onChange={(e) => setDetails({ ...details, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate">Number plate (optional)</Label>
                    <Input
                      id="plate"
                      maxLength={20}
                      placeholder="MH 01 AB 1234"
                      value={details.plate}
                      onChange={(e) => setDetails({ ...details, plate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred date</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={details.scheduledDate}
                      onChange={(e) => setDetails({ ...details, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time slot</Label>
                    <select
                      id="time"
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      value={details.scheduledTime}
                      onChange={(e) => setDetails({ ...details, scheduledTime: e.target.value })}
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Service address</Label>
                  <Input
                    id="address"
                    required
                    maxLength={300}
                    placeholder="Flat 402, Green Residency, Andheri East, Mumbai"
                    value={details.address}
                    onChange={(e) => setDetails({ ...details, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Describe the problem (optional)</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    maxLength={600}
                    value={details.notes}
                    onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                  />
                </div>

                <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
              </div>

              <aside className="glass-card h-fit p-6">
                <h2 className="font-display text-lg font-semibold">Summary</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="text-right font-medium">{service?.name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Mechanic</dt>
                    <dd className="text-right font-medium">{mechanic?.full_name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Service from</dt>
                    <dd>{formatRupees(service?.price_from ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Labour (1 hr)</dt>
                    <dd>{formatRupees(mechanic?.hourly_rate ?? 0)}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                  <span className="text-sm text-muted-foreground">Estimate</span>
                  <span className="font-display text-xl font-bold">{formatRupees(estimate)}</span>
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="mt-6 w-full"
                  disabled={mutation.isPending || !serviceId || !mechanicId}
                >
                  {mutation.isPending ? "Confirming…" : "Confirm booking"}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Final price is confirmed by your mechanic after diagnosis. No payment now.
                </p>
              </aside>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
