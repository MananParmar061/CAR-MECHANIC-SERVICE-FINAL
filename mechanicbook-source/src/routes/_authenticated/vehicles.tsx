import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Car, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addVehicle, deleteVehicle, listMyVehicles } from "@/lib/bookings.functions";

export const Route = createFileRoute("/_authenticated/vehicles")({
  head: () => ({
    meta: [
      { title: "My Vehicles — MechanicBook" },
      { name: "description", content: "Save your cars for one-tap service bookings." },
      { property: "og:title", content: "My Vehicles — MechanicBook" },
      { property: "og:description", content: "Manage the cars you book services for." },
    ],
  }),
  component: VehiclesPage,
});

const FUELS = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

function VehiclesPage() {
  const vehicles = useQuery({ queryKey: ["my-vehicles"], queryFn: () => listMyVehicles() });
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ make: "", model: "", year: "", plate: "", fuel: "Petrol" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const addMutation = useMutation({
    mutationFn: () =>
      addVehicle({
        data: {
          make: form.make,
          model: form.model,
          year: Number(form.year),
          plate: form.plate,
          fuel: form.fuel,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vehicles"] });
      setForm({ make: "", model: "", year: "", plate: "", fuel: "Petrol" });
      toast.success("Vehicle saved");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save the vehicle"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVehicle({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vehicles"] });
      setConfirmDelete(null);
      toast.success("Vehicle removed");
    },
    onError: () => toast.error("Could not remove the vehicle"),
  });

  const canSubmit = form.make.trim() && form.model.trim() && /^\d{4}$/.test(form.year.trim());

  return (
    <div>
      <section className="hero-surface border-b border-border/60">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Garage</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">My vehicles</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Save your cars once and they're ready for every booking. Plate numbers help your
            mechanic identify the car on arrival.
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="glass-card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Plus className="size-4 text-primary" /> Add a vehicle
              </h2>
              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (canSubmit) addMutation.mutate();
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="v-make">Make</Label>
                    <Input
                      id="v-make"
                      required
                      maxLength={60}
                      placeholder="Maruti Suzuki"
                      value={form.make}
                      onChange={(e) => setForm({ ...form, make: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-model">Model</Label>
                    <Input
                      id="v-model"
                      required
                      maxLength={60}
                      placeholder="Swift VXi"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-year">Year</Label>
                    <Input
                      id="v-year"
                      required
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="2022"
                      value={form.year}
                      onChange={(e) =>
                        setForm({ ...form, year: e.target.value.replace(/\D/g, "") })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-fuel">Fuel</Label>
                    <select
                      id="v-fuel"
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      value={form.fuel}
                      onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                    >
                      {FUELS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-plate">Number plate (optional)</Label>
                  <Input
                    id="v-plate"
                    maxLength={20}
                    placeholder="MH 01 AB 1234"
                    value={form.plate}
                    onChange={(e) => setForm({ ...form, plate: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  disabled={!canSubmit || addMutation.isPending}
                >
                  {addMutation.isPending ? "Saving…" : "Save vehicle"}
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              {(vehicles.data ?? []).map((v) => (
                <div key={v.id} className="glass-card flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Car className="size-4 text-primary" />
                    </span>
                    <div>
                      <p className="font-medium">
                        {v.make} {v.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {v.year}
                        {v.fuel ? ` · ${v.fuel}` : ""}
                        {v.plate ? ` · ${v.plate}` : ""}
                      </p>
                    </div>
                  </div>
                  {confirmDelete === v.id ? (
                    <div className="flex gap-2">
                      <Button
                        variant="hero"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(v.id)}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(null)}
                      >
                        Keep
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${v.make} ${v.model}`}
                      onClick={() => setConfirmDelete(v.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}

              {vehicles.isLoading && (
                <div className="glass-card animate-pulse p-8 text-center text-sm text-muted-foreground">
                  Loading your garage…
                </div>
              )}

              {!vehicles.isLoading && (vehicles.data ?? []).length === 0 && (
                <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                  No vehicles saved yet. Add your first car on the left — it will be pre-filled in
                  your next booking.
                </div>
              )}

              <div className="glass-card p-5 text-center">
                <p className="text-sm text-muted-foreground">Ready for a service?</p>
                <Button variant="heroOutline" size="sm" className="mt-3" asChild>
                  <Link to="/booking">Book a mechanic</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
