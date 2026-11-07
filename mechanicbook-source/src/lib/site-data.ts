import {
  Wrench,
  BatteryCharging,
  Disc3,
  Snowflake,
  Droplets,
  Waves,
  CircleDot,
  ClipboardCheck,
  LifeBuoy,
  Cog,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  engine: Cog,
  battery: BatteryCharging,
  brake: Disc3,
  ac: Snowflake,
  oil: Droplets,
  suspension: Waves,
  tyre: CircleDot,
  service: ClipboardCheck,
  roadside: LifeBuoy,
  wrench: Wrench,
};

export function serviceIcon(name: string): LucideIcon {
  return SERVICE_ICONS[name] ?? Wrench;
}

export const STATS = [
  { value: "5000+", label: "Happy Customers" },
  { value: "200+", label: "Expert Mechanics" },
  { value: "50+", label: "Cities Covered" },
  { value: "4.9★", label: "Average Rating" },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us about your car",
    body: "Add your vehicle and pick the service you need — or describe the problem and we'll match it.",
  },
  {
    step: "02",
    title: "Choose a verified mechanic",
    body: "Compare ratings, specialities and hourly rates. Every mechanic is background-verified.",
  },
  {
    step: "03",
    title: "Track the job live",
    body: "Accepted, on the way, in progress, complete. You always know exactly what's happening.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Ananya Deshpande",
    city: "Pune",
    rating: 5,
    quote:
      "Booked a brake job at 9 PM and the mechanic was at my building by 10 AM. Price was exactly what the app quoted.",
  },
  {
    name: "Rohit Malhotra",
    city: "Delhi",
    rating: 5,
    quote:
      "My AC died in peak summer. Vikram diagnosed a compressor fault in 20 minutes and fixed it the same day.",
  },
  {
    name: "Shalini Nair",
    city: "Kochi",
    rating: 5,
    quote:
      "I finally understand what was done to my car. Every task was explained in plain language before any work started.",
  },
];

export const VALUES = [
  {
    title: "Trust & Safety",
    body: "Every mechanic undergoes a 3-step verification: identity check, skill assessment, and background screening.",
  },
  {
    title: "Transparency",
    body: "No hidden fees. You see the price estimate before confirming, and the mechanic explains each task in plain language.",
  },
  {
    title: "Speed & Efficiency",
    body: "Book in under 2 minutes. Most mechanics respond within 30 minutes and can be at your location same day.",
  },
  {
    title: "Accountability",
    body: "Real-time job tracking and verified reviews after every job — with a 100% satisfaction guarantee.",
  },
];

export const ABOUT_STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "200+", label: "Certified Mechanics" },
  { value: "50+", label: "Cities" },
  { value: "4.9", label: "Avg. Rating" },
];

export const CONTACT_CARDS = [
  { title: "Call Us", line1: "+91 98765 43210", line2: "Mon–Sat, 9 AM – 7 PM" },
  { title: "Email Us", line1: "support@mechanicbook.com", line2: "Reply within 24 hours" },
  { title: "Visit Us", line1: "123 Auto Street, Mechanic Hub", line2: "Mumbai, MH 400001" },
  { title: "Working Hours", line1: "Mon–Sat: 9 AM – 7 PM", line2: "Sun: 10 AM – 4 PM" },
];

export const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "01:30 PM",
  "03:00 PM",
  "04:30 PM",
  "06:00 PM",
];

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  on_the_way: "On the way",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function formatRupees(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}
