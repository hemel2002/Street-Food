-- ── More Stalls ─────────────────────────────────────────────────────────
INSERT INTO public.stalls (id, owner_id, name, title, description, cover_pic, area, status, avg_rating, calories_info, prep_time, lat, lng, hours) VALUES
('vendor-10', 'owner-1', 'Golden Fried Chicken', 'Crispy Buttermilk Chicken', 'Double-fried buttermilk chicken served with our signature hot honey drizzle and buttery biscuits.',
 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
 'Fulton St, Brooklyn', 'approved', 4.7, '550kcal', '12 min', 40.6865, -73.9740,
 '{"Monday":{"open":"10:00","close":"22:00","closed":false},"Tuesday":{"open":"10:00","close":"22:00","closed":false},"Wednesday":{"open":"10:00","close":"22:00","closed":false},"Thursday":{"open":"10:00","close":"22:00","closed":false},"Friday":{"open":"10:00","close":"23:30","closed":false},"Saturday":{"open":"11:00","close":"23:30","closed":false},"Sunday":{"open":"11:00","close":"21:00","closed":false}}'),

('vendor-11', 'owner-2', 'Brooklyn Bagel Cart', 'Hand-Rolled Boiled Bagels', 'Authentic Brooklyn-style boiled bagels with artisanal flavored cream cheeses and cured lox.',
 'https://images.unsplash.com/photo-1596450514735-1110bfedae7b?w=600&auto=format&fit=crop&q=80',
 'Vanderbilt Ave, Brooklyn', 'approved', 4.9, '320kcal', '4 min', 40.6800, -73.9680,
 '{"Monday":{"open":"06:00","close":"16:00","closed":false},"Tuesday":{"open":"06:00","close":"16:00","closed":false},"Wednesday":{"open":"06:00","close":"16:00","closed":false},"Thursday":{"open":"06:00","close":"16:00","closed":false},"Friday":{"open":"06:00","close":"16:00","closed":false},"Saturday":{"open":"07:00","close":"15:00","closed":false},"Sunday":{"open":"07:00","close":"14:00","closed":false}}')

ON CONFLICT (id) DO UPDATE SET owner_id=EXCLUDED.owner_id, name=EXCLUDED.name, title=EXCLUDED.title, description=EXCLUDED.description, cover_pic=EXCLUDED.cover_pic, area=EXCLUDED.area, status=EXCLUDED.status, avg_rating=EXCLUDED.avg_rating, calories_info=EXCLUDED.calories_info, prep_time=EXCLUDED.prep_time, lat=EXCLUDED.lat, lng=EXCLUDED.lng, hours=EXCLUDED.hours;


-- ── More Foods ──────────────────────────────────────────────────────────
INSERT INTO public.foods (id, stall_id, name, price, rating, calories, prep_time_mins, ingredients, availability, cover_pic, category, video_url) VALUES
-- vendor-10 Golden Fried Chicken (Burger/Chicken)
('food-40', 'vendor-10', 'Spicy Chicken Sandwich',    11.00, 4.8, 620, 8, 'Spicy buttermilk fried chicken breast, pickles, slaw, brioche bun.', true, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-41', 'vendor-10', 'Chicken Tenders (5pc)',     10.00, 4.6, 500, 7, 'Hand-breaded chicken tenders served with honey mustard and ranch.', true, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),
('food-42', 'vendor-10', 'Loaded Fry Bucket',          8.00, 4.4, 750, 6, 'Crispy fries topped with cheese sauce, bacon bits, jalapeños, and scallions.', true, 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&auto=format&fit=crop&q=80', 'Burger', NULL),

-- vendor-11 Brooklyn Bagel Cart (Breakfast)
('food-43', 'vendor-11', 'Everything Lox Bagel',      14.00, 4.9, 450, 4, 'Toasted everything bagel, scallion cream cheese, Scottish smoked salmon, capers, red onion.', true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', 'American', NULL),
('food-44', 'vendor-11', 'BEC Classic',                8.00, 4.8, 520, 5, 'Bacon, over-easy egg, melted American cheese on a warm sesame bagel.', true, 'https://images.unsplash.com/photo-1596450514735-1110bfedae7b?w=600&auto=format&fit=crop&q=80', 'American', NULL),
('food-45', 'vendor-11', 'Blueberry Cream Bagel',      6.00, 4.5, 380, 2, 'Toasted cinnamon raisin bagel with whipped blueberry and honey cream cheese.', true, 'https://images.unsplash.com/photo-1625937715421-2e212fa92c5a?w=600&auto=format&fit=crop&q=80', 'Dessert', NULL)

ON CONFLICT (id) DO UPDATE SET stall_id=EXCLUDED.stall_id, name=EXCLUDED.name, price=EXCLUDED.price, rating=EXCLUDED.rating, calories=EXCLUDED.calories, prep_time_mins=EXCLUDED.prep_time_mins, ingredients=EXCLUDED.ingredients, availability=EXCLUDED.availability, cover_pic=EXCLUDED.cover_pic, category=EXCLUDED.category, video_url=EXCLUDED.video_url;


-- ── More Reviews ────────────────────────────────────────────────────────
INSERT INTO public.reviews (id, user_id, stall_id, rating, comment, created_at, user_name, vendor_reply) VALUES
('rev-24', 'cust-2',  'vendor-10', 5, 'Best fried chicken sandwich in all of NY. The crunch is unreal.',                      NOW() - INTERVAL '4 hours', 'Thomas Wright', 'Thanks Thomas! That crunch is our secret weapon.'),
('rev-25', 'cust-5',  'vendor-10', 4, 'Tenders were juicy but the fries got a little soggy on my way home.',                  NOW() - INTERVAL '1 day',   'Emily Brown',   NULL),
('rev-26', 'cust-8',  'vendor-11', 5, 'You cant beat a real Brooklyn BEC sandwich in the morning. Absolutely perfect.',       NOW() - INTERVAL '2 days',  'Alex Rivera',   NULL),
('rev-27', 'cust-6',  'vendor-11', 5, 'The lox was super fresh and they didn''t skimp on the cream cheese.',                 NOW() - INTERVAL '5 hours', 'Mike Johnson',  'Appreciate it Mike! Copious cream cheese is the only way.')

ON CONFLICT (id) DO UPDATE SET user_id=EXCLUDED.user_id, stall_id=EXCLUDED.stall_id, rating=EXCLUDED.rating, comment=EXCLUDED.comment, created_at=EXCLUDED.created_at, user_name=EXCLUDED.user_name, vendor_reply=EXCLUDED.vendor_reply;
