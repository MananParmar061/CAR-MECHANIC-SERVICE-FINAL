import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHero } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — MechanicBook" },
      {
        name: "description",
        content:
          "How MechanicBook works: verification, pricing, coverage, payments, cancellation and becoming a mechanic.",
      },
      { property: "og:title", content: "Frequently Asked Questions — MechanicBook" },
      {
        property: "og:description",
        content: "Everything you need to know before booking a verified mechanic.",
      },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "How are mechanics verified?",
    a: "Every mechanic on MechanicBook passes a 3-step check before their first job: government ID verification, a hands-on skill assessment, and a background screening. You'll see a Verified badge only after all three clear.",
  },
  {
    q: "How does pricing work?",
    a: "Each service shows a fixed starting price. Your estimate is service price + the mechanic's hourly labour rate, shown before you confirm. The mechanic confirms the final price after diagnosing the car — and only after you approve. No payment is taken at booking time.",
  },
  {
    q: "Which cities do you cover?",
    a: "We operate in 50+ cities across India, including Mumbai, Delhi, Bengaluru, Pune, Hyderabad, Chennai and Kolkata. The mechanics page shows every available city with live filters.",
  },
  {
    q: "How fast can a mechanic reach me?",
    a: "Most mechanics respond within 30 minutes and can be at your location the same day. During booking you pick a date and a time slot, and the mechanic confirms the exact arrival window.",
  },
  {
    q: "Do I need to pay anything upfront?",
    a: "No. You confirm the booking for free and pay only after the work is done and you're satisfied. The estimate is just that — an estimate you approve before any work starts.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. While a booking is still pending acceptance you can cancel free of charge from the booking detail page. Once the mechanic is on the way, please call support instead.",
  },
  {
    q: "Do you offer roadside assistance?",
    a: "Yes — jump-starts, flat tyres, fuel delivery and lockouts are covered under Roadside Assistance, typically with the fastest response times of any service.",
  },
  {
    q: "How do I become a MechanicBook partner?",
    a: "Register on the sign-up page as a mechanic. After your documents and skill assessment clear, your profile goes live and you start receiving jobs from customers in your city.",
  },
];

function FaqPage() {
  return (
    <div>
      <PageHero
        eyebrow="Help Center"
        title={
          <>
            Questions? <span className="text-gradient">Answered.</span>
          </>
        }
        subtitle="Everything about verification, pricing, coverage and bookings — in plain language."
      />

      <section className="section-py">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Accordion type="single" collapsible className="glass-card px-6">
            {FAQS.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display text-base font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="glass-card mt-10 flex flex-wrap items-center justify-between gap-4 p-8">
            <div>
              <h2 className="font-display text-xl font-bold">Still stuck?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Our support team replies within 24 hours, Mon–Sat 9 AM – 7 PM.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="heroOutline" size="sm" asChild>
                <Link to="/contact">Contact us</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/booking">
                  Book a mechanic <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
