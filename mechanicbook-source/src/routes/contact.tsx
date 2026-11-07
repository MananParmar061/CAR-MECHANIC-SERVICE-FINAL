import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/SiteLayout";
import { sendContactMessage } from "@/lib/catalog.functions";
import { CONTACT_CARDS } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact MechanicBook — Support & Enquiries" },
      {
        name: "description",
        content:
          "Call +91 98765 43210, email support@mechanicbook.com or send us a message. We reply within 24 hours.",
      },
      { property: "og:title", content: "Contact MechanicBook" },
      {
        property: "og:description",
        content: "Questions about a booking or joining as a mechanic? Talk to our team.",
      },
    ],
  }),
  component: ContactPage,
});

const CARD_ICONS = [Phone, Mail, MapPin, Clock];

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => sendContactMessage({ data }),
    onSuccess: () => {
      toast.success("Message sent — we'll reply within 24 hours.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: () => toast.error("Please check your details and try again."),
  });

  return (
    <div>
      <PageHero
        eyebrow="Contact Us"
        title={
          <>
            We're here to <span className="text-gradient">help</span>
          </>
        }
        subtitle="Questions about a booking, a service quote, or joining MechanicBook as a mechanic? Reach out any way you like."
      />

      <section className="section-py">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {CONTACT_CARDS.map((card, i) => {
              const Icon = CARD_ICONS[i] ?? Phone;
              return (
                <div key={card.title} className="glass-card flex gap-4 p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">{card.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{card.line1}</p>
                    <p className="text-xs text-muted-foreground">{card.line2}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            className="glass-card space-y-5 p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(form);
            }}
          >
            <h2 className="font-display text-xl font-semibold">Send us a message</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  maxLength={30}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                  id="subject"
                  maxLength={150}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                required
                rows={6}
                maxLength={2000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <Button type="submit" variant="hero" size="xl" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
