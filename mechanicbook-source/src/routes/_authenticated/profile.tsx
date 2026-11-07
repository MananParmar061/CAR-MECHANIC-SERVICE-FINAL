import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyAccount, updateProfile } from "@/lib/bookings.functions";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — MechanicBook" },
      { name: "description", content: "Update your name, phone number and city." },
      { property: "og:title", content: "My Profile — MechanicBook" },
      { property: "og:description", content: "Manage your MechanicBook account details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const account = useQuery({ queryKey: ["account"], queryFn: () => getMyAccount() });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ fullName: "", phone: "", city: "" });
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    const profile = account.data?.profile;
    if (profile && loadedFor !== profile.id) {
      setForm({
        fullName: profile.full_name ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
      });
      setLoadedFor(profile.id);
    }
  }, [account.data?.profile, loadedFor]);

  const saveMutation = useMutation({
    mutationFn: () => updateProfile({ data: form }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Could not save your profile"),
  });

  const isMechanic = account.data?.roles.includes("mechanic") ?? false;

  return (
    <div>
      <section className="hero-surface border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Account</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">My profile</h1>
          <p className="mt-3 text-muted-foreground">
            Keep your contact details current so your mechanic can reach you on the job day.
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6">
          <div className="glass-card p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">Personal details</h2>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Full name</Label>
                  <Input
                    id="p-name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-phone">Phone</Label>
                  <Input
                    id="p-phone"
                    type="tel"
                    maxLength={20}
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="p-city">City</Label>
                  <Input
                    id="p-city"
                    maxLength={60}
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" variant="hero" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Account type</dt>
                <dd className="font-medium">{isMechanic ? "Mechanic" : "Customer"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-medium">{user?.email ?? "—"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Want to book for someone else's car? Add it under{" "}
              <Link to="/vehicles" className="text-primary hover:underline">
                My vehicles
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
