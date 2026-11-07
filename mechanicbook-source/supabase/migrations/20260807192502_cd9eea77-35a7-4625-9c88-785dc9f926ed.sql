-- roles
CREATE TYPE public.app_role AS ENUM ('customer','mechanic','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  city text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, city, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''),'customer')::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  price_from integer NOT NULL,
  duration text NOT NULL,
  icon text NOT NULL DEFAULT 'wrench',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON public.services FOR SELECT TO anon, authenticated USING (true);

-- mechanics
CREATE TABLE public.mechanics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  specialty text NOT NULL,
  bio text NOT NULL DEFAULT '',
  city text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  review_count integer NOT NULL DEFAULT 0,
  jobs_done integer NOT NULL DEFAULT 0,
  experience_years integer NOT NULL DEFAULT 1,
  hourly_rate integer NOT NULL DEFAULT 500,
  verified boolean NOT NULL DEFAULT true,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mechanics TO anon, authenticated;
GRANT UPDATE ON public.mechanics TO authenticated;
GRANT ALL ON public.mechanics TO service_role;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mechanics_public_read" ON public.mechanics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "mechanics_update_own" ON public.mechanics FOR UPDATE TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- vehicles
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  plate text,
  fuel text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_own_all" ON public.vehicles FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- bookings
CREATE TYPE public.booking_status AS ENUM ('pending','accepted','on_the_way','in_progress','completed','cancelled');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE RESTRICT,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  vehicle_label text NOT NULL DEFAULT '',
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  address text NOT NULL,
  notes text,
  price_estimate integer NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_customer" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = customer_id);
CREATE POLICY "bookings_select_mechanic" ON public.bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mechanics m WHERE m.id = bookings.mechanic_id AND m.profile_id = auth.uid()));
CREATE POLICY "bookings_insert_customer" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "bookings_update_customer" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "bookings_update_mechanic" ON public.bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mechanics m WHERE m.id = bookings.mechanic_id AND m.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mechanics m WHERE m.id = bookings.mechanic_id AND m.profile_id = auth.uid()));
CREATE TRIGGER bookings_touch BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- contact messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_insert_any" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_admin_read" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- seed services
INSERT INTO public.services (slug, name, description, price_from, duration, icon, sort_order) VALUES
('engine-repair','Engine Repair & Diagnostics','Full engine health check using OBD-II scanners. Covers head gasket, pistons, valves, timing belts, and more.',800,'2–6 hrs','engine',1),
('electrical-battery','Electrical & Battery Systems','Complete electrical audit — alternator, starter motor, wiring, battery replacement, and EV-specific servicing.',600,'1–4 hrs','battery',2),
('brake-safety','Brake & Safety Systems','Brake pad/disc replacement, ABS sensor repair, emergency brake cable, and full safety inspection.',700,'1–3 hrs','brake',3),
('ac-climate','AC & Climate Control','Refrigerant top-up, compressor repair, condenser cleaning, cabin filter replacement, and full AC service.',900,'1–3 hrs','ac',4),
('oil-fluids','Oil & Fluid Services','Engine oil, gearbox fluid, brake fluid, power steering fluid, and coolant flush and refill.',400,'45 min','oil',5),
('suspension-steering','Suspension & Steering','Shock absorbers, struts, wheel alignment, power steering rack repair, and ball joint replacement.',1000,'2–5 hrs','suspension',6),
('tyres-wheels','Tyres & Wheels','Tyre rotation, balancing, alignment, puncture repair, and new tyre fitting for all vehicle types.',300,'30–90 min','tyre',7),
('general-service','General Service Package','Complete 40-point inspection with oil change, filter replacement, fluid top-up, and full wash.',1500,'3–4 hrs','service',8),
('roadside-assistance','Roadside Assistance','Emergency breakdown help, jump start, flat tyre change, and on-the-spot minor repairs at your location.',500,'30–60 min','roadside',9);

-- seed mechanics
INSERT INTO public.mechanics (full_name, specialty, bio, city, rating, review_count, jobs_done, experience_years, hourly_rate) VALUES
('Rajesh Kumar','Engine Specialist','12 years on petrol and diesel engines. Certified by Maruti and Hyundai service academies.','Mumbai',4.9,142,860,12,850),
('Amit Sharma','Electrical & EV','Auto-electrician turned EV specialist. Handles battery packs, wiring harnesses and diagnostics.','Delhi',4.8,118,640,9,780),
('Suresh Patel','Brake & Suspension','Brake and suspension expert with a track-day background. Precision alignment specialist.','Ahmedabad',4.9,96,510,10,720),
('Vikram Singh','AC & Climate Control','Trained on Denso and Sanden systems. Fast diagnosis of cooling loss and compressor faults.','Jaipur',4.7,84,430,8,690),
('Manoj Reddy','General Service','Full-service specialist. 40-point inspections and periodic maintenance for all Indian brands.','Hyderabad',4.8,201,1120,14,600),
('Farhan Ali','Diesel Engines','Heavy diesel and SUV powertrain expert. Turbo, injector and DPF work.','Lucknow',4.9,77,390,11,820),
('Deepak Joshi','Transmission','Manual and automatic gearbox rebuilds, clutch replacement, DSG mechatronics.','Pune',4.8,63,340,9,900),
('Ravi Menon','Tyres & Alignment','Wheel alignment, balancing and tyre fitting. Runs a mobile alignment rig.','Kochi',4.7,109,720,7,450),
('Sandeep Yadav','Roadside Assistance','24/7 breakdown response across the city. Jump starts, tyre changes and quick fixes.','Delhi',4.6,152,980,6,500),
('Nitin Bhosale','Bodywork & Denting','Denting, painting and panel work with colour-matched finishes.','Nagpur',4.8,58,290,13,700),
('Karthik Iyer','Hybrid & EV','Hybrid drivetrain and EV high-voltage certified. Tesla, Nexon EV and MG ZS experience.','Bengaluru',4.9,91,470,8,950),
('Imran Qureshi','Engine Diagnostics','OBD-II diagnostics and ECU remapping. Solves intermittent electronic faults.','Chennai',4.8,88,520,10,800);
