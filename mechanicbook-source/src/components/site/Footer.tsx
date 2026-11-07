import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary">
              <Wrench className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-bold">
              Mechanic<span className="text-primary">Book</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            India's most trusted mechanic platform. Certified mechanics, transparent pricing and
            real-time job tracking in 50+ cities.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-foreground">
                Services
              </Link>
            </li>
            <li>
              <Link to="/mechanics" className="hover:text-foreground">
                Mechanics
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Support</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>+91 98765 43210</li>
            <li>support@mechanicbook.com</li>
            <li>123 Auto Street, Mumbai</li>
            <li>Mon–Sat: 9 AM – 7 PM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MechanicBook. All rights reserved.
      </div>
    </footer>
  );
}
