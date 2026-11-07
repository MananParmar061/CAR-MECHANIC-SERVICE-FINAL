import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <section className="hero-surface border-b border-border/60">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
