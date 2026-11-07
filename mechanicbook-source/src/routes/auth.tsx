import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — MechanicBook" },
      {
        name: "description",
        content:
          "Log in to manage your car bookings, or create a free MechanicBook account to book a verified mechanic.",
      },
      { property: "og:title", content: "Sign In — MechanicBook" },
      { property: "og:description", content: "Access your bookings and mechanic dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          toast.success("Account created — check your email to confirm.");
          return;
        }
        toast.success("Welcome to MechanicBook!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <section className="hero-surface flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="glass-card w-full max-w-md p-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary glow-ring">
            <Wrench className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold">
            Mechanic<span className="text-primary">Book</span>
          </span>
        </div>

        <h1 className="mt-7 font-display text-2xl font-bold">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isRegister
            ? "Book verified mechanics and track every job in one place."
            : "Sign in to manage your bookings and vehicles."}
        </p>

        {checkEmail ? (
          <div className="mt-8 rounded-xl border border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
            We've sent a confirmation link to <span className="text-foreground">{email}</span>. Click
            it to activate your account, then sign in.
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={pending}>
              {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            </Button>
          </form>
        )}

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="heroOutline" size="xl" className="w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "New to MechanicBook?"}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => {
              setIsRegister((v) => !v);
              setCheckEmail(false);
            }}
          >
            {isRegister ? "Sign in" : "Create one"}
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Back to home
          </Link>
        </p>
      </div>
    </section>
  );
}
