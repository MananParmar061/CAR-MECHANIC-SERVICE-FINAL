import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }, { data: mechanic }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, city, avatar_url").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("mechanics").select("id, full_name, specialty, city").eq("profile_id", userId).maybeSingle(),
    ]);
    return {
      profile: profile ?? null,
      roles: (roles ?? []).map((r) => r.role as string),
      mechanic: mechanic ?? null,
    };
  });

export const listMyVehicles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("vehicles")
      .select("id, make, model, year, plate, fuel")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const vehicleSchema = z.object({
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  year: z.coerce.number().int().min(1980).max(2030),
  plate: z.string().trim().max(20).optional().or(z.literal("")),
  fuel: z.string().trim().max(30).optional().or(z.literal("")),
});

export const addVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => vehicleSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: vehicle, error } = await context.supabase
      .from("vehicles")
      .insert({
        owner_id: context.userId,
        make: data.make,
        model: data.model,
        year: data.year,
        plate: data.plate || null,
        fuel: data.fuel || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: vehicle.id };
  });

export const deleteVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("vehicles")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        phone: data.phone || null,
        city: data.city || null,
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const bookingSchema = z.object({
  mechanicId: z.string().uuid(),
  serviceId: z.string().uuid(),
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  year: z.coerce.number().int().min(1980).max(2030),
  plate: z.string().trim().max(20).optional().or(z.literal("")),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledTime: z.string().trim().min(3).max(20),
  address: z.string().trim().min(8).max(300),
  notes: z.string().trim().max(600).optional().or(z.literal("")),
  priceEstimate: z.coerce.number().int().min(0).max(1000000),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .insert({
        owner_id: userId,
        make: data.make,
        model: data.model,
        year: data.year,
        plate: data.plate || null,
      })
      .select("id")
      .single();
    if (vehicleError) throw new Error(vehicleError.message);

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: userId,
        mechanic_id: data.mechanicId,
        service_id: data.serviceId,
        vehicle_id: vehicle.id,
        vehicle_label: `${data.make} ${data.model} ${data.year}`,
        scheduled_date: data.scheduledDate,
        scheduled_time: data.scheduledTime,
        address: data.address,
        notes: data.notes || null,
        price_estimate: data.priceEstimate,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: booking.id };
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select(
        "id, vehicle_label, scheduled_date, scheduled_time, address, notes, price_estimate, status, created_at, customer_id, mechanics(id, full_name, specialty, rating, city), services(name)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBooking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [{ data: booking, error }, { data: review }] = await Promise.all([
      context.supabase
        .from("bookings")
        .select(
          "id, vehicle_label, scheduled_date, scheduled_time, address, notes, price_estimate, status, created_at, customer_id, mechanics(id, full_name, specialty, rating, city, verified, hourly_rate), services(name, icon, duration, price_from), vehicles(make, model, year, plate, fuel)",
        )
        .eq("id", data.id)
        .maybeSingle(),
      context.supabase
        .from("reviews")
        .select("id, rating, comment, created_at")
        .eq("booking_id", data.id)
        .maybeSingle(),
    ]);
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");
    return { booking, review: review ?? null };
  });

const statusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["pending", "accepted", "on_the_way", "in_progress", "completed", "cancelled"]),
});

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => statusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.bookingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  mechanicId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(600).optional().or(z.literal("")),
});

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reviews").insert({
      booking_id: data.bookingId,
      customer_id: context.userId,
      mechanic_id: data.mechanicId,
      rating: data.rating,
      comment: data.comment || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
