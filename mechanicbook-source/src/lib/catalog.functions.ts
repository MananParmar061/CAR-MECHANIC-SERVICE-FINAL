import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("services")
    .select("id, slug, name, description, price_from, duration, icon")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listMechanics = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("mechanics")
    .select(
      "id, full_name, specialty, bio, city, rating, review_count, jobs_done, experience_years, hourly_rate, verified, available",
    )
    .order("rating", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const mechanicIdSchema = z.object({ id: z.string().uuid() });

export const getMechanic = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => mechanicIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: mechanic, error } = await publicClient()
      .from("mechanics")
      .select(
        "id, full_name, specialty, bio, city, rating, review_count, jobs_done, experience_years, hourly_rate, verified, available",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return mechanic ?? null;
  });

export const listMechanicReviews = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ mechanicId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: reviews, error } = await publicClient()
      .from("reviews")
      .select("id, rating, comment, created_at")
      .eq("mechanic_id", data.mechanicId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return reviews ?? [];
  });

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
