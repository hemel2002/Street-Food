-- Supabase Setup Script for Street Food Discovery Platform
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com) and click Run.
-- Safe to run multiple times — all inserts use ON CONFLICT upserts.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('customer', 'vendor', 'admin')) NOT NULL DEFAULT 'customer',
    blocked BOOLEAN DEFAULT FALSE
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read profiles') THEN
    CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions for profiles') THEN
    CREATE POLICY "Allow all actions for profiles" ON public.profiles FOR ALL USING (true);
  END IF;
END $$;

-- 2. STALLS TABLE
CREATE TABLE IF NOT EXISTS public.stalls (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    description TEXT,
    cover_pic TEXT,
    area TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'suspended', 'closed')) NOT NULL DEFAULT 'pending',
    avg_rating NUMERIC DEFAULT 0,
    calories_info TEXT,
    prep_time TEXT,
    lat NUMERIC NOT NULL DEFAULT 40.6782,
    lng NUMERIC NOT NULL DEFAULT -73.9442,
    hours JSONB
);

-- Enable RLS for Stalls
ALTER TABLE public.stalls ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read stalls') THEN
    CREATE POLICY "Allow public read stalls" ON public.stalls FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions for stalls') THEN
    CREATE POLICY "Allow all actions for stalls" ON public.stalls FOR ALL USING (true);
  END IF;
END $$;

-- 3. FOODS TABLE
CREATE TABLE IF NOT EXISTS public.foods (
    id TEXT PRIMARY KEY,
    stall_id TEXT NOT NULL REFERENCES public.stalls(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    rating NUMERIC DEFAULT 0,
    calories NUMERIC DEFAULT 0,
    prep_time_mins NUMERIC DEFAULT 0,
    ingredients TEXT,
    availability BOOLEAN DEFAULT TRUE,
    cover_pic TEXT,
    category TEXT NOT NULL,
    video_url TEXT
);

-- Enable RLS for Foods
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read foods') THEN
    CREATE POLICY "Allow public read foods" ON public.foods FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions for foods') THEN
    CREATE POLICY "Allow all actions for foods" ON public.foods FOR ALL USING (true);
  END IF;
END $$;

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    stall_id TEXT NOT NULL REFERENCES public.stalls(id) ON DELETE CASCADE,
    rating NUMERIC NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_name TEXT,
    vendor_reply TEXT
);

-- Enable RLS for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read reviews') THEN
    CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions for reviews') THEN
    CREATE POLICY "Allow all actions for reviews" ON public.reviews FOR ALL USING (true);
  END IF;
END $$;

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    total_amount NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('pending', 'preparing', 'shipping', 'delivered')) NOT NULL DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read orders') THEN
    CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions for orders') THEN
    CREATE POLICY "Allow all actions for orders" ON public.orders FOR ALL USING (true);
  END IF;
END $$;

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    food_id TEXT NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL
);

-- Enable RLS for Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read order items') THEN
    CREATE POLICY "Allow public read order items" ON public.order_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions for order items') THEN
    CREATE POLICY "Allow all actions for order items" ON public.order_items FOR ALL USING (true);
  END IF;
END $$;


-- =========================================================================
-- SEED DATA — Production-quality dataset
-- =========================================================================

-- ── Profiles ────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, email, full_name, phone, role, blocked) VALUES
-- Admin
('admin-1',       'admin@gmail.com',          'System Admin',       '5551234',       'admin',    false),
-- Vendors (one per stall)
('owner-1',       'vendor@gmail.com',         'Ahmed Khan',         '0987654321',    'vendor',   false),
('owner-2',       'pizza_owner@gmail.com',    'Marco Pizzaiolo',    '+1 555-0202',   'vendor',   false),
('owner-3',       'sushi_owner@gmail.com',    'Kenji Tanaka',       '+1 555-0203',   'vendor',   false),
('owner-4',       'sweet_owner@gmail.com',    'Sophia Laurent',     '+1 555-0204',   'vendor',   false),
('owner-pending', 'taco_owner@gmail.com',     'Paco Hernandez',     '+1 555-0205',   'vendor',   false),
('owner-5',       'bbq_owner@gmail.com',      'James Pitmaster',    '+1 555-0206',   'vendor',   false),
('owner-6',       'noodle_owner@gmail.com',   'Li Wei Chen',        '+1 555-0207',   'vendor',   false),
('owner-7',       'falafel_owner@gmail.com',  'Omar Khalil',        '+1 555-0208',   'vendor',   false),
('owner-8',       'curry_owner@gmail.com',    'Priya Sharma',       '+1 555-0209',   'vendor',   false),
('owner-9',       'juice_owner@gmail.com',    'Ava Green',          '+1 555-0210',   'vendor',   false),
-- Customers
('cust-1',  'hemal@gmail.com',    'Hemal',            '1234567890',    'customer', false),
('cust-2',  'thomas@gmail.com',   'Thomas Wright',    '+1 555-0102',   'customer', false),
('cust-3',  'sarah@gmail.com',    'Sarah Jones',      '+1 555-0103',   'customer', false),
('cust-4',  'david@gmail.com',    'David Smith',      '+1 555-0104',   'customer', false),
('cust-5',  'emily@gmail.com',    'Emily Brown',      '+1 555-0105',   'customer', false),
('cust-6',  'mike@gmail.com',     'Mike Johnson',     '+1 555-0106',   'customer', false),
('cust-7',  'jessica@gmail.com',  'Jessica Miller',   '+1 555-0107',   'customer', false),
('cust-8',  'alex@gmail.com',     'Alex Rivera',      '+1 555-0108',   'customer', false),
('cust-9',  'nina@gmail.com',     'Nina Patel',       '+1 555-0109',   'customer', false),
('cust-10', 'chris@gmail.com',    'Chris Anderson',   '+1 555-0110',   'customer', false)
ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, full_name=EXCLUDED.full_name, phone=EXCLUDED.phone, role=EXCLUDED.role, blocked=EXCLUDED.blocked;


-- ── Stalls ──────────────────────────────────────────────────────────────
INSERT INTO public.stalls (id, owner_id, name, title, description, cover_pic, area, status, avg_rating, calories_info, prep_time, lat, lng, hours) VALUES
('vendor-1', 'owner-1', 'Double Hamburger Shop', 'Kenyaning Burger', 'The juiciest double-stacked burgers in Brooklyn. Grass-fed beef, artisan buns, and our legendary house sauce.',
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
 'Sterling Place, Brooklyn', 'approved', 4.8, '150kcal', '10 min', 40.6782, -73.9442,
 '{"Monday":{"open":"09:00","close":"21:00","closed":false},"Tuesday":{"open":"09:00","close":"21:00","closed":false},"Wednesday":{"open":"09:00","close":"21:00","closed":false},"Thursday":{"open":"09:00","close":"21:00","closed":false},"Friday":{"open":"09:00","close":"23:00","closed":false},"Saturday":{"open":"10:00","close":"23:00","closed":false},"Sunday":{"open":"10:00","close":"20:00","closed":false}}'),

('vendor-2', 'owner-2', 'Pizzeria Brooklyn', 'Wood-fired Slices', 'Premium wood-fired pizzas made with 72-hour sourdough fermentation and organic San Marzano tomatoes.',
 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
 'Grand Ave, Brooklyn', 'approved', 4.9, '340kcal', '15 min', 40.6792, -73.9392,
 '{"Monday":{"open":"11:00","close":"22:00","closed":false},"Tuesday":{"open":"11:00","close":"22:00","closed":false},"Wednesday":{"open":"11:00","close":"22:00","closed":false},"Thursday":{"open":"11:00","close":"22:00","closed":false},"Friday":{"open":"11:00","close":"23:00","closed":false},"Saturday":{"open":"11:00","close":"23:00","closed":false},"Sunday":{"open":"12:00","close":"21:00","closed":false}}'),

('vendor-3', 'owner-3', 'Sushi Wave', 'Fresh Seafood Rolls', 'Fresh sushi, sashimi, and bento boxes crafted daily by Master Chef Tanaka. Omakase available on weekends.',
 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
 'Flatbush Ave, Brooklyn', 'approved', 4.7, '200kcal', '12 min', 40.6752, -73.9512,
 '{"Monday":{"open":"12:00","close":"21:30","closed":false},"Tuesday":{"open":"12:00","close":"21:30","closed":false},"Wednesday":{"open":"12:00","close":"21:30","closed":false},"Thursday":{"open":"12:00","close":"21:30","closed":false},"Friday":{"open":"12:00","close":"22:30","closed":false},"Saturday":{"open":"12:00","close":"22:30","closed":false},"Sunday":{"open":"12:00","close":"21:00","closed":true}}'),

('vendor-pending-1', 'owner-pending', 'Taco Loco', 'Authentic Street Tacos', 'Fresh corn tortillas, house-made salsas verde & roja, and slow-cooked meats from family recipes passed down three generations.',
 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
 'Prospect Heights, Brooklyn', 'pending', 4.5, '185kcal', '8 min', 40.6772, -73.9632,
 '{"Monday":{"open":"10:00","close":"20:00","closed":false},"Tuesday":{"open":"10:00","close":"20:00","closed":false},"Wednesday":{"open":"10:00","close":"20:00","closed":false},"Thursday":{"open":"10:00","close":"20:00","closed":false},"Friday":{"open":"10:00","close":"22:00","closed":false},"Saturday":{"open":"10:00","close":"22:00","closed":false},"Sunday":{"open":"10:00","close":"18:00","closed":false}}'),

('vendor-4', 'owner-4', 'Brooklyn Waffle & Crepe Co.', 'Gourmet Sweet Crepes & Waffles', 'Freshly baked Belgian waffles and warm sweet crepes topped with fresh fruit, melted Belgian chocolate, and homemade gelato.',
 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
 'Sterling Place, Brooklyn', 'approved', 4.9, '280kcal', '7 min', 40.6765, -73.9460,
 '{"Monday":{"open":"08:00","close":"22:00","closed":false},"Tuesday":{"open":"08:00","close":"22:00","closed":false},"Wednesday":{"open":"08:00","close":"22:00","closed":false},"Thursday":{"open":"08:00","close":"22:00","closed":false},"Friday":{"open":"08:00","close":"23:30","closed":false},"Saturday":{"open":"08:00","close":"23:30","closed":false},"Sunday":{"open":"09:00","close":"22:00","closed":false}}'),

('vendor-5', 'owner-5', 'Smoke & Barrel BBQ', 'Low & Slow Smoked Meats', 'Texas-style brisket, pulled pork, and smoked ribs with a 14-hour oak wood smoking process. Award-winning dry rubs.',
 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80',
 'Atlantic Ave, Brooklyn', 'approved', 4.6, '450kcal', '5 min', 40.6862, -73.9782,
 '{"Monday":{"open":"11:00","close":"21:00","closed":false},"Tuesday":{"open":"11:00","close":"21:00","closed":false},"Wednesday":{"open":"11:00","close":"21:00","closed":false},"Thursday":{"open":"11:00","close":"21:00","closed":false},"Friday":{"open":"11:00","close":"22:00","closed":false},"Saturday":{"open":"11:00","close":"22:00","closed":false},"Sunday":{"open":"12:00","close":"20:00","closed":false}}'),

('vendor-6', 'owner-6', 'Dragon Wok Express', 'Hand-Pulled Noodles & Dim Sum', 'Authentic Szechuan hand-pulled noodles, steaming dim sum baskets, and wok-fired specialties. MSG-free recipes.',
 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
 'Court St, Brooklyn', 'approved', 4.5, '310kcal', '10 min', 40.6882, -73.9932,
 '{"Monday":{"open":"11:30","close":"22:00","closed":false},"Tuesday":{"open":"11:30","close":"22:00","closed":false},"Wednesday":{"open":"11:30","close":"22:00","closed":false},"Thursday":{"open":"11:30","close":"22:00","closed":false},"Friday":{"open":"11:30","close":"23:00","closed":false},"Saturday":{"open":"11:30","close":"23:00","closed":false},"Sunday":{"open":"12:00","close":"21:00","closed":false}}'),

('vendor-7', 'owner-7', 'Pita Palace', 'Mediterranean Street Eats', 'Crispy falafel, creamy hummus, and flame-grilled shawarma wraps. All sauces made fresh daily from scratch.',
 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80',
 'Smith St, Brooklyn', 'approved', 4.7, '290kcal', '8 min', 40.6832, -73.9892,
 '{"Monday":{"open":"10:00","close":"22:00","closed":false},"Tuesday":{"open":"10:00","close":"22:00","closed":false},"Wednesday":{"open":"10:00","close":"22:00","closed":false},"Thursday":{"open":"10:00","close":"22:00","closed":false},"Friday":{"open":"10:00","close":"23:00","closed":false},"Saturday":{"open":"10:00","close":"23:00","closed":false},"Sunday":{"open":"11:00","close":"21:00","closed":false}}'),

('vendor-8', 'owner-8', 'Curry Kingdom', 'Spicy Indian Street Food', 'Butter chicken, biryani, samosas, and authentic tikka masala. Spice levels from mild to extra-fiery.',
 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
 'Bergen St, Brooklyn', 'approved', 4.8, '350kcal', '12 min', 40.6812, -73.9742,
 '{"Monday":{"open":"11:00","close":"22:00","closed":false},"Tuesday":{"open":"11:00","close":"22:00","closed":false},"Wednesday":{"open":"11:00","close":"22:00","closed":false},"Thursday":{"open":"11:00","close":"22:00","closed":false},"Friday":{"open":"11:00","close":"23:00","closed":false},"Saturday":{"open":"11:00","close":"23:00","closed":false},"Sunday":{"open":"12:00","close":"21:00","closed":false}}'),

('vendor-9', 'owner-9', 'Green Squeeze Juice Bar', 'Cold-Pressed Juices & Smoothies', 'Organic cold-pressed juices, acai bowls, and protein smoothies. 100% plant-based, zero added sugar.',
 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&auto=format&fit=crop&q=80',
 'Dean St, Brooklyn', 'approved', 4.4, '120kcal', '5 min', 40.6802, -73.9682,
 '{"Monday":{"open":"07:00","close":"20:00","closed":false},"Tuesday":{"open":"07:00","close":"20:00","closed":false},"Wednesday":{"open":"07:00","close":"20:00","closed":false},"Thursday":{"open":"07:00","close":"20:00","closed":false},"Friday":{"open":"07:00","close":"21:00","closed":false},"Saturday":{"open":"08:00","close":"21:00","closed":false},"Sunday":{"open":"08:00","close":"18:00","closed":false}}'),

('vendor-pending-2', 'owner-6', 'Bao Bun House', 'Fluffy Steamed Bao Buns', 'Hand-folded steamed bao buns with braised pork belly, hoisin, and pickled daikon. Pending admin approval.',
 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
 'Pacific St, Brooklyn', 'pending', 4.3, '260kcal', '6 min', 40.6842, -73.9812,
 '{"Monday":{"open":"11:00","close":"21:00","closed":false},"Tuesday":{"open":"11:00","close":"21:00","closed":false},"Wednesday":{"open":"11:00","close":"21:00","closed":false},"Thursday":{"open":"11:00","close":"21:00","closed":false},"Friday":{"open":"11:00","close":"22:00","closed":false},"Saturday":{"open":"11:00","close":"22:00","closed":false},"Sunday":{"open":"12:00","close":"20:00","closed":false}}')

ON CONFLICT (id) DO UPDATE SET owner_id=EXCLUDED.owner_id, name=EXCLUDED.name, title=EXCLUDED.title, description=EXCLUDED.description, cover_pic=EXCLUDED.cover_pic, area=EXCLUDED.area, status=EXCLUDED.status, avg_rating=EXCLUDED.avg_rating, calories_info=EXCLUDED.calories_info, prep_time=EXCLUDED.prep_time, lat=EXCLUDED.lat, lng=EXCLUDED.lng, hours=EXCLUDED.hours;


-- ── Foods ───────────────────────────────────────────────────────────────
INSERT INTO public.foods (id, stall_id, name, price, rating, calories, prep_time_mins, ingredients, availability, cover_pic, category, video_url) VALUES
-- vendor-1  Double Hamburger Shop (Burger)
('food-1',  'vendor-1', 'Double Hamburger',          12.00, 4.8, 150, 10, 'Double beef patty, cheddar cheese, fresh lettuce, tomatoes, sesame bun, house burger sauce.', true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-3',  'vendor-1', 'Spinach & Chicken Bowl',    16.00, 4.6, 220, 12, 'Grilled chicken breast, sautéed baby spinach, parmesan cream sauce, garlic croutons.', true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-4',  'vendor-1', 'Thai Soup with Cheese',      8.00, 4.5, 110,  8, 'Lemongrass, coconut milk, mild cheddar, fresh shrimp, lime leaves.', true, 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-5',  'vendor-1', 'Burger with Shrimps',       15.00, 4.7, 180, 12, 'Crispy fried shrimp, brioche bun, spicy mayo, pickled onion, arugula.', true, 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-12', 'vendor-1', 'BBQ Bacon Smash Burger',    14.00, 4.9, 420, 10, 'Smashed double patty, crispy bacon, BBQ glaze, pickles, American cheese, potato bun.', true, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),

-- vendor-2  Pizzeria Brooklyn (Pizza)
('food-2',  'vendor-2', 'Melting Cheese Pizza',       35.00, 4.9, 340, 15, 'Mozzarella, cheddar, gorgonzola, fresh basil, wood-fired thin crust.', true, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', 'Pizza', NULL),
('food-6',  'vendor-2', 'Pepperoni Sourdough Pizza',  38.00, 4.9, 380, 15, 'Double pepperoni, hot honey drizzle, aged mozzarella, organic marinara, sourdough crust.', true, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80', 'Pizza', NULL),
('food-13', 'vendor-2', 'Truffle Mushroom Pizza',     42.00, 4.8, 360, 18, 'Wild mushroom medley, truffle oil, fontina cheese, fresh thyme, garlic cream base.', true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80', 'Pizza', NULL),
('food-14', 'vendor-2', 'Margherita Classica',        28.00, 4.7, 280, 12, 'San Marzano tomato, fresh mozzarella di bufala, basil, extra virgin olive oil.', true, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80', 'Pizza', NULL),

-- vendor-3  Sushi Wave (Sushi)
('food-7',  'vendor-3', 'Dragon Roll Special',        22.00, 4.8, 210, 12, 'Eel and cucumber inside, sliced avocado and unagi sauce outside, tobiko topping.', true, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-8',  'vendor-3', 'Spicy Tuna Crunch',          18.00, 4.7, 190, 10, 'Spicy minced tuna, cucumber, green onion, tempura crunch, spicy sriracha mayo.', true, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-15', 'vendor-3', 'Rainbow Sashimi Platter',    32.00, 4.9, 180,  8, 'Tuna, salmon, yellowtail, shrimp, octopus — 15 pieces with wasabi and pickled ginger.', true, 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-16', 'vendor-3', 'Teriyaki Salmon Bento',      26.00, 4.6, 320, 15, 'Grilled teriyaki salmon, steamed rice, edamame, miso soup, pickled vegetables.', true, 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),

-- vendor-pending-1  Taco Loco (Mexican)
('food-9',  'vendor-pending-1', 'Birria Taco Platter', 15.00, 4.8, 240, 8, 'Three slow-cooked beef birria tacos with melted cheese, onions, cilantro, and warm consommé for dipping.', true, 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600&auto=format&fit=crop&q=80', 'Mexican', NULL),
('food-17', 'vendor-pending-1', 'Loaded Nachos Supreme', 13.00, 4.5, 380, 6, 'Tortilla chips, queso, jalapeños, black beans, sour cream, guacamole, pico de gallo.', true, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80', 'Mexican', NULL),
('food-18', 'vendor-pending-1', 'Churros con Chocolate',  9.00, 4.7, 290, 5, 'Crispy cinnamon sugar churros served with warm Mexican chocolate dipping sauce.', true, 'https://images.unsplash.com/photo-1624371414361-e670246e0a04?w=600&auto=format&fit=crop&q=80', 'Dessert', NULL),

-- vendor-4  Brooklyn Waffle & Crepe Co. (Dessert)
('food-10', 'vendor-4', 'Strawberry Nutella Crepe',   10.00, 4.9, 260, 6, 'Warm sweet crepe filled with freshly sliced strawberries, loaded with Nutella spread, dusted with powdered sugar.', true, 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80', 'Dessert', NULL),
('food-11', 'vendor-4', 'Gelato Bubble Waffle',       12.00, 4.8, 320, 8, 'Hot bubble waffle cone loaded with two scoops of vanilla bean and chocolate fudge gelato, rainbow sprinkles.', true, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80', 'Dessert', NULL),
('food-19', 'vendor-4', 'Bananas Foster Waffle',      14.00, 4.7, 350, 8, 'Belgian waffle topped with caramelized bananas, brown sugar rum sauce, vanilla ice cream, whipped cream.', true, 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80', 'Dessert', NULL),
('food-20', 'vendor-4', 'Matcha Tiramisu Crepe',      11.00, 4.6, 240, 7, 'Matcha-infused crepe with mascarpone cream, cocoa dusting, and white chocolate drizzle.', true, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80', 'Dessert', NULL),

-- vendor-5  Smoke & Barrel BBQ (Burger category for now)
('food-21', 'vendor-5', 'Smoked Brisket Plate',       18.00, 4.8, 520, 5, '14-hour oak-smoked beef brisket, coleslaw, cornbread, pickles, and house BBQ sauce.', true, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-22', 'vendor-5', 'Pulled Pork Sandwich',       14.00, 4.7, 440, 5, 'Slow-smoked pulled pork, tangy vinegar slaw, house pickles, on a toasted brioche bun.', true, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-23', 'vendor-5', 'Baby Back Ribs Half Rack',   22.00, 4.9, 580, 5, 'Half rack of baby back ribs, dry-rubbed and smoked, glazed with honey chipotle sauce.', true, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),

-- vendor-6  Dragon Wok Express (Sushi category)
('food-24', 'vendor-6', 'Dan Dan Noodles',            13.00, 4.6, 380, 10, 'Hand-pulled noodles, spicy Szechuan peppercorn pork sauce, bok choy, peanuts, chili oil.', true, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-25', 'vendor-6', 'Pork Dumpling Basket (8pc)', 11.00, 4.7, 290, 12, 'Steamed pork and chive dumplings with black vinegar and ginger dipping sauce.', true, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-26', 'vendor-6', 'Kung Pao Chicken Rice',      14.00, 4.5, 420, 10, 'Wok-fired chicken thigh, roasted peanuts, dried chili peppers, jasmine rice.', true, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),

-- vendor-7  Pita Palace (Burger category for now)
('food-27', 'vendor-7', 'Falafel Wrap',               11.00, 4.7, 310, 8, 'Crispy chickpea falafel, tahini sauce, pickled turnip, fresh herbs, warm pita bread.', true, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-28', 'vendor-7', 'Chicken Shawarma Plate',     15.00, 4.8, 420, 10, 'Flame-grilled marinated chicken, garlic sauce, hummus, tabbouleh, warm flatbread, pickles.', true, 'https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-29', 'vendor-7', 'Lamb Kofta Kebab',           16.00, 4.6, 380, 12, 'Spiced ground lamb skewers, tzatziki, grilled vegetables, fluffy rice pilaf.', true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),

-- vendor-8  Curry Kingdom (Sushi category for now)
('food-30', 'vendor-8', 'Butter Chicken with Naan',   16.00, 4.9, 420, 12, 'Creamy tomato butter sauce, tender tandoori chicken, garlic naan, basmati rice.', true, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-31', 'vendor-8', 'Chicken Biryani',            14.00, 4.8, 380, 15, 'Layered basmati rice with spiced chicken, saffron, fried onions, raita on the side.', true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-32', 'vendor-8', 'Samosa Chaat Platter',        9.00, 4.5, 260,  5, 'Crispy samosas topped with chickpea curry, yogurt, tamarind chutney, sev, and fresh cilantro.', true, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-33', 'vendor-8', 'Paneer Tikka Masala',        13.00, 4.7, 340, 12, 'Grilled paneer cubes in smoky tikka masala sauce with bell peppers, served with jeera rice.', true, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),

-- vendor-9  Green Squeeze Juice Bar (Drinks)
('food-34', 'vendor-9', 'Green Goddess Juice',         8.00, 4.5, 90,  3, 'Kale, spinach, green apple, ginger, lemon, celery — cold-pressed and raw.', true, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&auto=format&fit=crop&q=80', 'Drinks', NULL),
('food-35', 'vendor-9', 'Tropical Acai Bowl',         12.00, 4.8, 240,  5, 'Blended acai, banana, mango, topped with granola, coconut flakes, honey, and fresh berries.', true, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80', 'Drinks', NULL),
('food-36', 'vendor-9', 'Mango Lassi Smoothie',        7.00, 4.6, 180,  3, 'Fresh Alfonso mangoes blended with yogurt, cardamom, and a touch of honey.', true, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80', 'Drinks', NULL),
('food-37', 'vendor-9', 'Berry Protein Blast',         9.00, 4.4, 210,  4, 'Mixed berries, banana, whey protein, almond milk, chia seeds, and flax.', true, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&auto=format&fit=crop&q=80', 'Drinks', NULL),

-- vendor-pending-2 Bao Bun House (pending stall)
('food-38', 'vendor-pending-2', 'Pork Belly Bao Bun',  10.00, 4.7, 280, 6, 'Fluffy steamed bao bun, braised pork belly, hoisin glaze, pickled daikon, crushed peanuts.', true, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL),
('food-39', 'vendor-pending-2', 'Crispy Tofu Bao',      9.00, 4.5, 220, 6, 'Crispy fried tofu, sriracha mayo, pickled cucumber, sesame seeds, fresh cilantro in steamed bao.', true, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', 'Sushi', NULL)

ON CONFLICT (id) DO UPDATE SET stall_id=EXCLUDED.stall_id, name=EXCLUDED.name, price=EXCLUDED.price, rating=EXCLUDED.rating, calories=EXCLUDED.calories, prep_time_mins=EXCLUDED.prep_time_mins, ingredients=EXCLUDED.ingredients, availability=EXCLUDED.availability, cover_pic=EXCLUDED.cover_pic, category=EXCLUDED.category, video_url=EXCLUDED.video_url;


-- ── Reviews ─────────────────────────────────────────────────────────────
INSERT INTO public.reviews (id, user_id, stall_id, rating, comment, created_at, user_name, vendor_reply) VALUES
('rev-1',  'cust-1',  'vendor-1', 5, 'Best double cheeseburgers in Brooklyn. Super juicy patties!',                                  NOW() - INTERVAL '1 day',    'Hemal',          NULL),
('rev-2',  'cust-2',  'vendor-1', 4, 'Delicious burger but can take a few extra minutes during peak hours.',                          NOW() - INTERVAL '12 hours',  'Thomas Wright',  'Thanks for the feedback Thomas! We are adding an extra grill to speed up peak hours.'),
('rev-3',  'cust-3',  'vendor-2', 5, 'Authentic wood-fired sourdough crust. The melting cheese pizza is to die for!',                 NOW() - INTERVAL '2 days',    'Sarah Jones',    NULL),
('rev-4',  'cust-4',  'vendor-3', 5, 'High quality tuna and fast service. Best sushi rolls in Brooklyn.',                             NOW() - INTERVAL '6 hours',   'David Smith',    'Thank you David! We source our fish fresh every single morning.'),
('rev-5',  'cust-5',  'vendor-4', 5, 'The waffle was so crispy and Nutella was perfect. Kids loved it!',                              NOW() - INTERVAL '18 hours',  'Emily Brown',    NULL),
('rev-6',  'cust-1',  'vendor-2', 4, 'Loved the Pepperoni sourdough pizza. Very tasty, but parking is tough around here.',            NOW() - INTERVAL '3 days',    'Hemal',          'Glad you enjoyed the pizza! We offer curbside pick-up too.'),
('rev-7',  'cust-3',  'vendor-3', 4, 'Delicious dragon rolls, super fresh ingredients.',                                              NOW() - INTERVAL '30 hours',  'Sarah Jones',    NULL),
('rev-8',  'cust-6',  'vendor-5', 5, 'The brisket literally melts in your mouth. 14-hour smoke is no joke!',                          NOW() - INTERVAL '4 hours',   'Mike Johnson',   'Thanks Mike! Low and slow is the only way we know.'),
('rev-9',  'cust-7',  'vendor-5', 4, 'Ribs were incredible but the sides could use a bit more flavor.',                               NOW() - INTERVAL '2 days',    'Jessica Miller', 'Appreciate the honest feedback Jessica! New coleslaw recipe coming soon.'),
('rev-10', 'cust-8',  'vendor-6', 5, 'Best hand-pulled noodles outside of China. The dan dan noodles are addictive!',                 NOW() - INTERVAL '8 hours',   'Alex Rivera',    'Thank you Alex! Chef Li pulls every single noodle by hand.'),
('rev-11', 'cust-9',  'vendor-7', 5, 'The falafel wrap is perfection. Crispy outside, fluffy inside. Tahini sauce is amazing.',        NOW() - INTERVAL '1 day',     'Nina Patel',     NULL),
('rev-12', 'cust-10', 'vendor-7', 4, 'Great shawarma plate. Huge portion! Could use a bit more garlic sauce though.',                 NOW() - INTERVAL '3 days',    'Chris Anderson', 'We now offer extra garlic sauce on the side for free, Chris!'),
('rev-13', 'cust-2',  'vendor-8', 5, 'The butter chicken is restaurant quality at street food prices. Incredible.',                   NOW() - INTERVAL '5 hours',   'Thomas Wright',  'So glad you loved it Thomas! Our chef trained in Delhi for 10 years.'),
('rev-14', 'cust-5',  'vendor-8', 5, 'Biryani was perfectly layered and the raita was fresh. Will come back every week!',             NOW() - INTERVAL '2 days',    'Emily Brown',    NULL),
('rev-15', 'cust-6',  'vendor-9', 4, 'Green Goddess juice is refreshing but a bit too much ginger for my taste.',                     NOW() - INTERVAL '10 hours',  'Mike Johnson',   'Thanks Mike! You can always ask us to go light on ginger.'),
('rev-16', 'cust-9',  'vendor-9', 5, 'The acai bowl is gorgeous and tastes even better. Fresh berries every time.',                   NOW() - INTERVAL '1 day',     'Nina Patel',     NULL),
('rev-17', 'cust-7',  'vendor-4', 5, 'Bananas Foster waffle is an absolute dream. The rum sauce is heavenly.',                        NOW() - INTERVAL '4 days',    'Jessica Miller', NULL),
('rev-18', 'cust-8',  'vendor-1', 5, 'BBQ Bacon Smash Burger is the new king. Smoky, cheesy, perfection.',                            NOW() - INTERVAL '3 hours',   'Alex Rivera',    'Thank you Alex! That smash burger is our newest creation.'),
('rev-19', 'cust-4',  'vendor-6', 4, 'Dumplings were juicy and well-seasoned. The vinegar dip is the perfect pairing.',               NOW() - INTERVAL '36 hours',  'David Smith',    NULL),
('rev-20', 'cust-10', 'vendor-2', 5, 'Truffle mushroom pizza blew my mind. Worth every penny of the $42.',                            NOW() - INTERVAL '6 hours',   'Chris Anderson', 'Thrilled you loved it Chris! We forage the mushrooms locally when in season.'),
('rev-21', 'cust-1',  'vendor-5', 4, 'Pulled pork sandwich was smoky and tender. Vinegar slaw is a great touch.',                     NOW() - INTERVAL '5 days',    'Hemal',          NULL),
('rev-22', 'cust-3',  'vendor-8', 5, 'Samosa chaat was an explosion of flavors. Sweet, tangy, spicy — perfect balance.',              NOW() - INTERVAL '8 hours',   'Sarah Jones',    'Thank you Sarah! That''s our most popular street snack.'),
('rev-23', 'cust-6',  'vendor-4', 4, 'Matcha tiramisu crepe is unique and delicious. Very Instagram-worthy too!',                     NOW() - INTERVAL '2 days',    'Mike Johnson',   NULL)
ON CONFLICT (id) DO UPDATE SET user_id=EXCLUDED.user_id, stall_id=EXCLUDED.stall_id, rating=EXCLUDED.rating, comment=EXCLUDED.comment, created_at=EXCLUDED.created_at, user_name=EXCLUDED.user_name, vendor_reply=EXCLUDED.vendor_reply;


-- ── Orders ──────────────────────────────────────────────────────────────
INSERT INTO public.orders (id, user_id, total_amount, status, delivery_address, created_at) VALUES
('order-101', 'cust-1',  32.00,  'pending',   'Flatbush Ave, Brooklyn',      NOW() - INTERVAL '10 minutes'),
('order-102', 'cust-2',  35.00,  'preparing', 'Grand Ave, Brooklyn',         NOW() - INTERVAL '25 minutes'),
('order-103', 'cust-3',  56.00,  'delivered', 'Park Place, Brooklyn',        NOW() - INTERVAL '2 hours'),
('order-104', 'cust-4',  18.00,  'delivered', 'Prospect Place, Brooklyn',    NOW() - INTERVAL '5 hours'),
('order-105', 'cust-5',  40.00,  'delivered', 'St Marks Ave, Brooklyn',      NOW() - INTERVAL '24 hours'),
('order-106', 'cust-1',  38.00,  'delivered', 'Sterling Place, Brooklyn',    NOW() - INTERVAL '48 hours'),
('order-107', 'cust-6',  40.00,  'shipping',  'Atlantic Ave, Brooklyn',      NOW() - INTERVAL '35 minutes'),
('order-108', 'cust-7',  26.00,  'delivered', 'Court St, Brooklyn',          NOW() - INTERVAL '3 hours'),
('order-109', 'cust-8',  22.00,  'preparing', 'Smith St, Brooklyn',          NOW() - INTERVAL '15 minutes'),
('order-110', 'cust-9',  30.00,  'delivered', 'Bergen St, Brooklyn',         NOW() - INTERVAL '6 hours'),
('order-111', 'cust-10', 20.00,  'delivered', 'Dean St, Brooklyn',           NOW() - INTERVAL '12 hours'),
('order-112', 'cust-1',  42.00,  'delivered', 'Sterling Place, Brooklyn',    NOW() - INTERVAL '72 hours'),
('order-113', 'cust-3',  27.00,  'pending',   'Flatbush Ave, Brooklyn',      NOW() - INTERVAL '5 minutes'),
('order-114', 'cust-5',  14.00,  'delivered', 'Grand Ave, Brooklyn',         NOW() - INTERVAL '36 hours'),
('order-115', 'cust-2',  16.00,  'shipping',  'Bergen St, Brooklyn',         NOW() - INTERVAL '20 minutes')
ON CONFLICT (id) DO UPDATE SET user_id=EXCLUDED.user_id, total_amount=EXCLUDED.total_amount, status=EXCLUDED.status, delivery_address=EXCLUDED.delivery_address, created_at=EXCLUDED.created_at;


-- ── Order Items ─────────────────────────────────────────────────────────
-- Clean first to allow re-runs
DELETE FROM public.order_items WHERE order_id IN ('order-101','order-102','order-103','order-104','order-105','order-106','order-107','order-108','order-109','order-110','order-111','order-112','order-113','order-114','order-115');

INSERT INTO public.order_items (order_id, food_id, quantity, price) VALUES
('order-101', 'food-1',  2, 12.00),
('order-101', 'food-4',  1,  8.00),
('order-102', 'food-2',  1, 35.00),
('order-103', 'food-7',  2, 22.00),
('order-103', 'food-11', 1, 12.00),
('order-104', 'food-8',  1, 18.00),
('order-105', 'food-10', 4, 10.00),
('order-106', 'food-6',  1, 38.00),
('order-107', 'food-21', 1, 18.00),
('order-107', 'food-23', 1, 22.00),
('order-108', 'food-24', 2, 13.00),
('order-109', 'food-27', 2, 11.00),
('order-110', 'food-30', 1, 16.00),
('order-110', 'food-31', 1, 14.00),
('order-111', 'food-34', 1,  8.00),
('order-111', 'food-35', 1, 12.00),
('order-112', 'food-13', 1, 42.00),
('order-113', 'food-28', 1, 15.00),
('order-113', 'food-35', 1, 12.00),
('order-114', 'food-22', 1, 14.00),
('order-115', 'food-30', 1, 16.00);
