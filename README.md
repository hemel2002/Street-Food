🌮 Street Eats Hub

A production-ready backend database architecture for a Hyper-Local Street Food Discovery & Ordering Platform, built with Supabase and PostgreSQL.

Street Eats Hub enables customers to discover nearby street food vendors, browse menus, leave reviews, and place orders while providing vendors and administrators with powerful management tools.

---

🚀 Features

👤 Customer

- Browse nearby food stalls
- View menus and food details
- Search by category, location, or rating
- Leave ratings and reviews
- Place and track orders

🏪 Vendor

- Create and manage stalls
- Manage food items and availability
- Respond to customer reviews
- Process customer orders

🛠️ Admin

- Approve or suspend vendors
- Monitor platform activity
- Manage users and stalls

---

🏗️ Database Architecture

       ┌──────────────┐
       │   PROFILES   │
       └──────┬───────┘
              │
              ├───────────────────────────┐
              │                           │
              ▼                           ▼

       ┌──────────────┐           ┌──────────────┐
       │    STALLS    │           │    ORDERS    │
       └──────┬───────┘           └──────┬───────┘
              │                          │
      ┌───────┴─────────┐                │
      ▼                 ▼                ▼

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    FOODS     │ │   REVIEWS    │ │ ORDER_ITEMS  │
└──────────────┘ └──────────────┘ └──────────────┘

---

📂 Database Schema

profiles

Stores all users of the platform.

Column| Type
id| UUID (PK)
email| TEXT UNIQUE
full_name| TEXT
phone| TEXT
role| customer, vendor, admin
blocked| BOOLEAN

---

stalls

Represents food trucks, carts, and food stalls.

Column| Type
id| UUID (PK)
owner_id| FK → profiles
name| TEXT
title| TEXT
description| TEXT
cover_pic| TEXT
area| TEXT
status| pending, approved, suspended, closed
avg_rating| NUMERIC
calories_info| TEXT
prep_time| INTEGER
lat| NUMERIC
lng| NUMERIC
hours| JSONB

---

foods

Menu items offered by stalls.

Column| Type
id| UUID (PK)
stall_id| FK → stalls
name| TEXT
price| NUMERIC
rating| NUMERIC
calories| INTEGER
prep_time_mins| INTEGER
ingredients| TEXT
availability| BOOLEAN
cover_pic| TEXT
category| TEXT
video_url| TEXT

---

reviews

Customer ratings and comments.

Column| Type
id| UUID (PK)
user_id| FK → profiles
stall_id| FK → stalls
rating| NUMERIC
comment| TEXT
created_at| TIMESTAMP
user_name| TEXT
vendor_reply| TEXT

---

orders

Customer orders.

Column| Type
id| UUID (PK)
user_id| FK → profiles
total_amount| NUMERIC
status| pending, preparing, shipping, delivered
delivery_address| TEXT
created_at| TIMESTAMP

---

order_items

Individual items within an order.

Column| Type
id| BIGSERIAL (PK)
order_id| FK → orders
food_id| FK → foods
quantity| INTEGER
price| NUMERIC

---

🔒 Row Level Security (RLS)

Table| Read Access| Write Access
profiles| Public| System Controlled
stalls| Public| Vendor/Admin
foods| Public| Stall Owner
reviews| Public| Customers & Vendors
orders| Authenticated Users| Customer/Vendor
order_items| Authenticated Users| Order Owner

---

⚡ Quick Start

1. Create a Supabase Project

1. Sign in to Supabase.
2. Create a new project.
3. Choose a region.

2. Run the SQL Schema

1. Open SQL Editor.
2. Click New Query.
3. Paste the schema script.
4. Click Run.

3. Verify Sample Data

Demo Accounts:

Admin  : admin@gmail.com
Vendor : vendor@gmail.com

Sample stalls include:

- 🍔 Burger Truck
- 🍕 Pizza Corner
- 🍣 Sushi Roll Cart
- 🧇 Waffle & Crepes
- 🍗 Jamaican Jerk Grill

---

📍 Planned Enhancements

Dynamic Rating Triggers

Automatically update stall ratings when reviews are added or modified.

PostGIS Integration

- Nearby stall search
- Distance calculation
- Radius filtering
- Geo-spatial indexing

Smart Schedule Engine

Determine:

- Open Now
- Closing Soon
- Closed
- Opens Tomorrow

Payment Integration

- Stripe
- SSLCommerz
- bKash
- Nagad

Mobile Application

- Flutter App
- Push Notifications
- Live Order Tracking

---

🛠️ Tech Stack

- PostgreSQL
- Supabase
- Supabase Auth
- Supabase Storage
- Leaflet
- Geoapify
- Flutter
- React / Next.js

---

📄 License

Licensed under the MIT License.

---

⭐ Support

If you find this project useful, please consider giving it a star on GitHub.
