'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'vendor' | 'admin';
  blocked?: boolean;
}

export interface Stall {
  id: string;
  owner_id: string;
  name: string;
  title: string;
  description: string;
  cover_pic: string;
  area: string;
  status: 'pending' | 'approved' | 'suspended' | 'closed';
  avg_rating: number;
  calories_info?: string;
  prep_time?: string;
  lat: number;
  lng: number;
  hours?: {
    [day: string]: { open: string; close: string; closed: boolean };
  };
}

export interface Food {
  id: string;
  stall_id: string;
  name: string;
  price: number;
  rating: number;
  calories: number;
  prep_time_mins: number;
  ingredients: string;
  availability: boolean;
  cover_pic: string;
  category: string;
  video_url?: string;
}

export interface CartItem {
  food: Food;
  quantity: number;
}

export interface Review {
  id: string;
  user_id: string;
  stall_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  vendor_reply?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_id: string;
  quantity: number;
  price: number;
  food_name?: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: 'pending' | 'preparing' | 'shipping' | 'delivered';
  delivery_address: string;
  created_at: string;
  items?: OrderItem[];
}

export interface VlogReel {
  id: string;
  stall_id: string;
  title: string;
  blogger: string;
  video_url: string;
  likes: number;
}

export interface Complaint {
  id: string;
  stall_id: string;
  stall_name: string;
  user_name: string;
  reason: string;
  status: 'pending' | 'resolved';
  created_at: string;
}

export interface VendorPromoCode {
  id: string;
  stall_id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  active: boolean;
}

interface AppContextType {
  stalls: Stall[];
  foods: Food[];
  cart: CartItem[];
  reviews: Review[];
  vlogs: VlogReel[];
  selectedStall: Stall | null;
  selectedFood: Food | null;
  currentUser: Profile | null;
  isLoading: boolean;
  isDarkMode: boolean;
  currentLocation: string;
  promoCode: string;
  discountAmount: number;
  orderStatus: 'pending' | 'preparing' | 'shipping' | 'delivered';
  orders: Order[];
  complaints: Complaint[];
  vendorPromoCodes: VendorPromoCode[];
  favoriteStallIds: string[];
  favoriteFoodIds: string[];
  userLocation: { lat: number; lng: number } | null;
  profiles: Profile[];
  
  // Actions
  setSelectedStall: (stall: Stall | null) => void;
  setSelectedFood: (food: Food | null) => void;
  addToCart: (food: Food, quantity?: number) => void;
  removeFromCart: (foodId: string) => void;
  updateCartQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  setPromoCode: (code: string) => void;
  setCurrentLocation: (loc: string) => void;
  toggleTheme: () => void;
  loginUser: (email: string, role: 'customer' | 'vendor' | 'admin') => Promise<void>;
  registerUser: (email: string, fullName: string, role: 'customer' | 'vendor' | 'admin') => Promise<boolean>;
  logoutUser: () => void;
  addReview: (stallId: string, rating: number, comment: string) => Promise<void>;
  addFood: (foodData: Omit<Food, 'id'>) => Promise<boolean>;
  deleteFood: (foodId: string) => Promise<boolean>;
  checkout: (address: string) => Promise<void>;
  setOrderStatus: (status: 'pending' | 'preparing' | 'shipping' | 'delivered') => void;
  updateStall: (stallId: string, stallData: Partial<Stall>) => Promise<boolean>;
  toggleFoodAvailability: (foodId: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<Profile>) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: 'pending' | 'preparing' | 'shipping' | 'delivered') => Promise<boolean>;
  
  // New features actions
  detectUserLocation: () => void;
  addReviewReply: (reviewId: string, reply: string) => Promise<boolean>;
  addComplaint: (stallId: string, reason: string) => Promise<boolean>;
  toggleFavoriteStall: (stallId: string) => void;
  toggleFavoriteFood: (foodId: string) => void;
  addVendorPromoCode: (promo: Omit<VendorPromoCode, 'id'>) => Promise<boolean>;
  togglePromoCodeStatus: (promoId: string) => void;
  approveVendor: (stallId: string) => Promise<boolean>;
  suspendVendor: (stallId: string) => Promise<boolean>;
  deleteVendor: (stallId: string) => Promise<boolean>;
  blockUser: (email: string) => Promise<boolean>;
  unblockUser: (email: string) => Promise<boolean>;
  resolveComplaint: (complaintId: string) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
}

const MOCK_STALLS: Stall[] = [
  {
    id: 'vendor-1',
    owner_id: 'owner-1',
    name: 'Double Hamburger Shop',
    title: 'Kenyaning Burger',
    description: 'The double hamger is a hamburger sold by the international fast food restaurent chain kenyaning. It was introduced in than...',
    cover_pic: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    area: 'Sterling place, Vrooklyn',
    status: 'approved',
    avg_rating: 4.8,
    calories_info: '150kcal',
    prep_time: '10 min',
    lat: 40.6782,
    lng: -73.9442,
    hours: {
      Monday: { open: '09:00', close: '21:00', closed: false },
      Tuesday: { open: '09:00', close: '21:00', closed: false },
      Wednesday: { open: '09:00', close: '21:00', closed: false },
      Thursday: { open: '09:00', close: '21:00', closed: false },
      Friday: { open: '09:00', close: '23:00', closed: false },
      Saturday: { open: '10:00', close: '23:00', closed: false },
      Sunday: { open: '10:00', close: '20:00', closed: false },
    }
  },
  {
    id: 'vendor-2',
    owner_id: 'owner-2',
    name: 'Pizzeria Vrooklyn',
    title: 'Wood-fired Slices',
    description: 'Premium wood-fired pizzas made with high-hydration sourdough and organic San Marzano tomatoes.',
    cover_pic: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    area: 'Grand Ave, Vrooklyn',
    status: 'approved',
    avg_rating: 4.9,
    calories_info: '340kcal',
    prep_time: '15 min',
    lat: 40.6792,
    lng: -73.9392,
    hours: {
      Monday: { open: '11:00', close: '22:00', closed: false },
      Tuesday: { open: '11:00', close: '22:00', closed: false },
      Wednesday: { open: '11:00', close: '22:00', closed: false },
      Thursday: { open: '11:00', close: '22:00', closed: false },
      Friday: { open: '11:00', close: '23:00', closed: false },
      Saturday: { open: '11:00', close: '23:00', closed: false },
      Sunday: { open: '12:00', close: '21:00', closed: false },
    }
  },
  {
    id: 'vendor-3',
    owner_id: 'owner-3',
    name: 'Sushi Wave',
    title: 'Fresh Seafood Rolls',
    description: 'Fresh sushi, sashimi, and bento boxes crafted daily by Master Sushi Chef Tanaka.',
    cover_pic: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
    area: 'Flatbush Ave, Vrooklyn',
    status: 'approved',
    avg_rating: 4.7,
    calories_info: '200kcal',
    prep_time: '12 min',
    lat: 40.6752,
    lng: -73.9512,
    hours: {
      Monday: { open: '12:00', close: '21:30', closed: false },
      Tuesday: { open: '12:00', close: '21:30', closed: false },
      Wednesday: { open: '12:00', close: '21:30', closed: false },
      Thursday: { open: '12:00', close: '21:30', closed: false },
      Friday: { open: '12:00', close: '22:30', closed: false },
      Saturday: { open: '12:00', close: '22:30', closed: false },
      Sunday: { open: '12:00', close: '21:00', closed: true },
    }
  },
  {
    id: 'vendor-pending-1',
    owner_id: 'owner-pending',
    name: 'Taco Loco',
    title: 'Authentic Street Tacos',
    description: 'Fresh corn tortillas, house-made salsas, and slow-cooked meats.',
    cover_pic: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
    area: 'Prospect Heights, Vrooklyn',
    status: 'pending',
    avg_rating: 4.5,
    calories_info: '185kcal',
    prep_time: '8 min',
    lat: 40.6772,
    lng: -73.9632,
    hours: {
      Monday: { open: '10:00', close: '20:00', closed: false },
      Tuesday: { open: '10:00', close: '20:00', closed: false },
      Wednesday: { open: '10:00', close: '20:00', closed: false },
      Thursday: { open: '10:00', close: '20:00', closed: false },
      Friday: { open: '10:00', close: '22:00', closed: false },
      Saturday: { open: '10:00', close: '22:00', closed: false },
      Sunday: { open: '10:00', close: '18:00', closed: false },
    }
  },
  {
    id: 'vendor-4',
    owner_id: 'owner-4',
    name: 'Brooklyn Waffle & Crepe Co.',
    title: 'Gourmet Sweet Crepes & Waffles',
    description: 'Freshly baked Belgian waffles and warm sweet crepes topped with fresh fruit, melted Belgian chocolate, and homemade gelato.',
    cover_pic: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
    area: 'Sterling place, Vrooklyn',
    status: 'approved',
    avg_rating: 4.9,
    calories_info: '280kcal',
    prep_time: '7 min',
    lat: 40.6765,
    lng: -73.9460,
    hours: {
      Monday: { open: '12:00', close: '22:00', closed: false },
      Tuesday: { open: '12:00', close: '22:00', closed: false },
      Wednesday: { open: '12:00', close: '22:00', closed: false },
      Thursday: { open: '12:00', close: '22:00', closed: false },
      Friday: { open: '12:00', close: '23:30', closed: false },
      Saturday: { open: '12:00', close: '23:30', closed: false },
      Sunday: { open: '12:00', close: '22:00', closed: false },
    }
  }
];

const MOCK_FOODS: Food[] = [
  {
    id: 'food-1',
    stall_id: 'vendor-1',
    name: 'Double Hamburger',
    price: 12.00,
    rating: 4.8,
    calories: 150,
    prep_time_mins: 10,
    ingredients: 'Double beef patty, cheddar cheese, fresh lettuce, tomatoes, sesame bun, house burger sauce.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    category: 'Burger',
  },
  {
    id: 'food-2',
    stall_id: 'vendor-2',
    name: 'Melting Cheese Pizza',
    price: 35.00,
    rating: 4.9,
    calories: 340,
    prep_time_mins: 15,
    ingredients: 'Mozzarella, cheddar, gorgonzola, fresh basil, wood-fired thin crust.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    category: 'Pizza',
  },
  {
    id: 'food-3',
    stall_id: 'vendor-1',
    name: 'Spinach & Chicken',
    price: 16.00,
    rating: 4.6,
    calories: 220,
    prep_time_mins: 12,
    ingredients: 'Grilled chicken breast, sautéed baby spinach, parmesan cream sauce.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    category: 'Sushi',
  },
  {
    id: 'food-4',
    stall_id: 'vendor-1',
    name: 'Thai Soup with Cheese',
    price: 8.00,
    rating: 4.5,
    calories: 110,
    prep_time_mins: 8,
    ingredients: 'Lemongrass, coconut milk, mild cheddar, fresh shrimp.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&auto=format&fit=crop&q=80',
    category: 'Sushi',
  },
  {
    id: 'food-5',
    stall_id: 'vendor-1',
    name: 'Burger with Shrimps',
    price: 15.00,
    rating: 4.7,
    calories: 180,
    prep_time_mins: 12,
    ingredients: 'Crispy fried shrimp, brioche bun, spicy mayo, pickled onion.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80',
    category: 'Burger',
  },
  {
    id: 'food-6',
    stall_id: 'vendor-2',
    name: 'Pepperoni Sourdough Pizza',
    price: 38.00,
    rating: 4.9,
    calories: 380,
    prep_time_mins: 15,
    ingredients: 'Double pepperoni, hot honey drizzle, aged mozzarella, organic marinara, sourdough crust.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
    category: 'Pizza'
  },
  {
    id: 'food-7',
    stall_id: 'vendor-3',
    name: 'Dragon Roll Special',
    price: 22.00,
    rating: 4.8,
    calories: 210,
    prep_time_mins: 12,
    ingredients: 'Eel and cucumber inside, sliced avocado and unagi sauce outside, tobiko topping.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop&q=80',
    category: 'Sushi'
  },
  {
    id: 'food-8',
    stall_id: 'vendor-3',
    name: 'Spicy Tuna Crunch',
    price: 18.00,
    rating: 4.7,
    calories: 190,
    prep_time_mins: 10,
    ingredients: 'Spicy minced tuna, cucumber, green onion, tempura crunch, spicy sriracha mayo.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop&q=80',
    category: 'Sushi'
  },
  {
    id: 'food-9',
    stall_id: 'vendor-pending-1',
    name: 'Birria Taco Platter',
    price: 15.00,
    rating: 4.8,
    calories: 240,
    prep_time_mins: 8,
    ingredients: 'Three slow-cooked beef birria tacos with melted cheese, onions, cilantro, and warm consommé broth for dipping.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600&auto=format&fit=crop&q=80',
    category: 'Mexican'
  },
  {
    id: 'food-10',
    stall_id: 'vendor-4',
    name: 'Strawberry Nutella Crepe',
    price: 10.00,
    rating: 4.9,
    calories: 260,
    prep_time_mins: 6,
    ingredients: 'Warm sweet crepe filled with freshly sliced strawberries, loaded with Nutella spread, dusted with powdered sugar.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80',
    category: 'Dessert'
  },
  {
    id: 'food-11',
    stall_id: 'vendor-4',
    name: 'Gelato Bubble Waffle',
    price: 12.00,
    rating: 4.8,
    calories: 320,
    prep_time_mins: 8,
    ingredients: 'Hot bubble waffle cone loaded with two scoops of vanilla bean and chocolate fudge gelato, rainbow sprinkles, chocolate drizzle.',
    availability: true,
    cover_pic: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
    category: 'Dessert'
  }
];

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    user_id: 'cust-1',
    stall_id: 'vendor-1',
    rating: 5,
    comment: 'Best double cheeseburgers in Vrooklyn. Super juicy patties!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user_name: 'Jessica Miller',
  },
  {
    id: 'rev-2',
    user_id: 'cust-2',
    stall_id: 'vendor-1',
    rating: 4,
    comment: 'Delicious burger but can take a few extra minutes during peak hours.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    user_name: 'Thomas Wright',
    vendor_reply: 'Thanks for the feedback Thomas! We are adding an extra grill to speed up peak hours.'
  },
  {
    id: 'rev-3',
    user_id: 'cust-3',
    stall_id: 'vendor-2',
    rating: 5,
    comment: 'Authentic wood-fired sourdough crust. The melting cheese pizza is to die for!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    user_name: 'Sarah Jones',
  },
  {
    id: 'rev-4',
    user_id: 'cust-4',
    stall_id: 'vendor-3',
    rating: 5,
    comment: 'High quality tuna and fast service. Best sushi rolls in Brooklyn.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    user_name: 'David Smith',
    vendor_reply: 'Thank you David! We source our fish fresh every single morning.'
  },
  {
    id: 'rev-5',
    user_id: 'cust-5',
    stall_id: 'vendor-4',
    rating: 5,
    comment: 'The waffle was so crispy and Nutella was perfect. Kids loved it!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    user_name: 'Emily Brown',
  },
  {
    id: 'rev-6',
    user_id: 'cust-1',
    stall_id: 'vendor-2',
    rating: 4,
    comment: 'Loved the Pepperoni sourdough pizza. Very tasty, but parking is tough around here.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    user_name: 'Jessica Miller',
    vendor_reply: 'Glad you enjoyed the pizza, Jessica! We offer curbside pick-up too.'
  },
  {
    id: 'rev-7',
    user_id: 'cust-3',
    stall_id: 'vendor-3',
    rating: 4,
    comment: 'Delicious poke rolls, super fresh ingredients.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    user_name: 'Sarah Jones',
  }
];

const MOCK_REELS: VlogReel[] = [
  {
    id: 'reel-1',
    stall_id: 'vendor-1',
    title: 'Testing the juiciest double hamburger in Brooklyn!',
    blogger: 'FoodieGourmet',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-in-a-professional-kitchen-34246-large.mp4',
    likes: 1240
  },
  {
    id: 'reel-2',
    stall_id: 'vendor-2',
    title: 'Wood-fired sourdough pizza review. Absolutely melting!',
    blogger: 'PizzaLoverNY',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-pizza-34247-large.mp4',
    likes: 850
  }
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'order-101',
    user_id: 'cust-1',
    total_amount: 32.00,
    status: 'pending',
    delivery_address: 'Flatbush Ave, Brooklyn',
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    items: [
      { id: 'item-101-1', order_id: 'order-101', food_id: 'food-1', quantity: 2, price: 12.00, food_name: 'Double Hamburger' },
      { id: 'item-101-2', order_id: 'order-101', food_id: 'food-4', quantity: 1, price: 8.00, food_name: 'Thai Soup with Cheese' }
    ]
  },
  {
    id: 'order-102',
    user_id: 'cust-2',
    total_amount: 35.00,
    status: 'preparing',
    delivery_address: 'Grand Ave, Brooklyn',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    items: [
      { id: 'item-102-1', order_id: 'order-102', food_id: 'food-2', quantity: 1, price: 35.00, food_name: 'Melting Cheese Pizza' }
    ]
  },
  {
    id: 'order-103',
    user_id: 'cust-3',
    total_amount: 56.00,
    status: 'delivered',
    delivery_address: 'Park Place, Brooklyn',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    items: [
      { id: 'item-103-1', order_id: 'order-103', food_id: 'food-7', quantity: 2, price: 22.00, food_name: 'Dragon Roll Special' },
      { id: 'item-103-2', order_id: 'order-103', food_id: 'food-11', quantity: 1, price: 12.00, food_name: 'Gelato Bubble Waffle' }
    ]
  },
  {
    id: 'order-104',
    user_id: 'cust-4',
    total_amount: 18.00,
    status: 'delivered',
    delivery_address: 'Prospect Place, Brooklyn',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    items: [
      { id: 'item-104-1', order_id: 'order-104', food_id: 'food-8', quantity: 1, price: 18.00, food_name: 'Spicy Tuna Crunch' }
    ]
  },
  {
    id: 'order-105',
    user_id: 'cust-5',
    total_amount: 40.00,
    status: 'delivered',
    delivery_address: 'St Marks Ave, Brooklyn',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    items: [
      { id: 'item-105-1', order_id: 'order-105', food_id: 'food-10', quantity: 4, price: 10.00, food_name: 'Strawberry Nutella Crepe' }
    ]
  },
  {
    id: 'order-106',
    user_id: 'cust-1',
    total_amount: 38.00,
    status: 'delivered',
    delivery_address: 'Sterling Place, Brooklyn',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    items: [
      { id: 'item-106-1', order_id: 'order-106', food_id: 'food-6', quantity: 1, price: 38.00, food_name: 'Pepperoni Sourdough Pizza' }
    ]
  }
];

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-1',
    stall_id: 'vendor-1',
    stall_name: 'Double Hamburger Shop',
    user_name: 'Thomas Wright',
    reason: 'The order took 45 minutes to prepare and was cold.',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  }
];

const MOCK_PROMO_CODES: VendorPromoCode[] = [
  {
    id: 'promo-1',
    stall_id: 'vendor-1',
    code: 'BURGER50',
    discount: 0.5,
    type: 'percentage',
    active: true
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vlogs] = useState<VlogReel[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLocation, setCurrentLocation] = useState('Sterling place, Vrooklyn');
  const [promoCode, setPromoCodeState] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'shipping' | 'delivered'>('pending');
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [vendorPromoCodes, setVendorPromoCodes] = useState<VendorPromoCode[]>([]);
  const [favoriteStallIds, setFavoriteStallIds] = useState<string[]>([]);
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({ lat: 40.6782, lng: -73.9442 });

  // Load state from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vrooklyn_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    
    const savedTheme = localStorage.getItem('vrooklyn_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark-mode');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
    }

    const savedUser = localStorage.getItem('vrooklyn_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save user session to local storage when state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vrooklyn_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vrooklyn_user');
    }
  }, [currentUser]);

  // Fetch real data from Supabase if configured, otherwise fall back to mock data
  useEffect(() => {
    async function loadData() {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
      ) {
        console.log('Using pre-seeded mock data (Supabase URL not configured).');
        setStalls(MOCK_STALLS);
        setFoods(MOCK_FOODS);
        setReviews(MOCK_REVIEWS);
        setOrders(MOCK_ORDERS);
        setComplaints(MOCK_COMPLAINTS);
        setVendorPromoCodes(MOCK_PROMO_CODES);
        if (MOCK_STALLS.length > 0) setSelectedStall(MOCK_STALLS[0]);
        if (MOCK_FOODS.length > 0) setSelectedFood(MOCK_FOODS[0]);
        return;
      }

      try {
        const { data: stallsData, error: stallsError } = await supabase.from('stalls').select('*');
        if (stallsError) throw stallsError;
        if (stallsData) {
          setStalls(stallsData as Stall[]);
          if (stallsData.length > 0) setSelectedStall(stallsData[0] as Stall);
        }

        const { data: foodsData, error: foodsError } = await supabase.from('foods').select('*');
        if (foodsError) throw foodsError;
        if (foodsData) {
          setFoods(foodsData as Food[]);
          if (foodsData.length > 0) setSelectedFood(foodsData[0] as Food);
        }

        const { data: reviewsData, error: reviewsError } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (reviewsError) throw reviewsError;
        if (reviewsData) {
          setReviews(reviewsData as Review[]);
        }

        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
        if (profilesError) throw profilesError;
        if (profilesData) {
          setProfiles(profilesData as Profile[]);
          if (currentUser) {
            const dbUser = profilesData.find(p => p.email.toLowerCase() === currentUser.email.toLowerCase());
            if (dbUser) setCurrentUser(dbUser as Profile);
          }
        }

        const { data: complaintsData, error: complaintsError } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
        if (!complaintsError && complaintsData) {
          setComplaints(complaintsData as Complaint[]);
        }

        const { data: promoCodesData, error: promoCodesError } = await supabase.from('vendor_promo_codes').select('*');
        if (!promoCodesError && promoCodesData) {
          setVendorPromoCodes(promoCodesData as VendorPromoCode[]);
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              foods (
                name
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        if (ordersData) {
          const parsedOrders = ordersData.map((order: any) => ({
            id: order.id,
            user_id: order.user_id,
            total_amount: order.total_amount,
            status: order.status,
            delivery_address: order.delivery_address,
            created_at: order.created_at,
            items: order.order_items?.map((item: any) => ({
              id: item.id.toString(),
              order_id: item.order_id,
              food_id: item.food_id,
              quantity: item.quantity,
              price: item.price,
              food_name: item.foods?.name || 'Unknown Item'
            })) || []
          }));
          setOrders(parsedOrders);
        }
      } catch (e) {
        console.error('Failed to query database', e);
      }
    }
    loadData();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('vrooklyn_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('vrooklyn_theme', 'light');
      }
      return nextTheme;
    });
  };

  const addToCart = (food: Food, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      let nextCart;
      if (existing) {
        nextCart = prev.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        nextCart = [...prev, { food, quantity }];
      }
      localStorage.setItem('vrooklyn_cart', JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart((prev) => {
      const nextCart = prev.filter((item) => item.food.id !== foodId);
      localStorage.setItem('vrooklyn_cart', JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const updateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart((prev) => {
      const nextCart = prev.map((item) =>
        item.food.id === foodId ? { ...item, quantity } : item
      );
      localStorage.setItem('vrooklyn_cart', JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('vrooklyn_cart');
    setPromoCodeState('');
    setDiscountAmount(0);
  };

  const applyPromoCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    
    // Check vendor-specific codes first
    const vendorCode = vendorPromoCodes.find(p => p.code === cleanCode && p.active);
    if (vendorCode) {
      setPromoCodeState(vendorCode.code);
      if (vendorCode.type === 'fixed') {
        setDiscountAmount(vendorCode.discount);
      } else {
        const subtotal = cart.reduce((acc, item) => acc + (item.food.price * item.quantity), 0);
        setDiscountAmount(subtotal * vendorCode.discount);
      }
      return true;
    }

    if (cleanCode === 'WELCOME20') {
      setPromoCodeState('WELCOME20');
      setDiscountAmount(20); 
      return true;
    }
    if (cleanCode === 'STREET30') {
      setPromoCodeState('STREET30');
      setDiscountAmount(30); 
      return true;
    }
    return false;
  };

  const loginUser = async (email: string, role: 'customer' | 'vendor' | 'admin') => {
    const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
    } else {
      let id = `user-${Date.now()}`;
      if (email === 'hemal@gmail.com') id = 'cust-1';
      else if (email === 'vendor@gmail.com') id = 'owner-1';
      else if (email === 'admin@gmail.com') id = 'admin-1';

      const profile: Profile = {
        id,
        email,
        full_name: email.split('@')[0],
        phone: '+1 555-0199',
        role,
        blocked: false
      };
      setCurrentUser(profile);
      setProfiles(prev => {
        if (!prev.some(p => p.id === profile.id)) {
          return [...prev, profile];
        }
        return prev;
      });

      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
      ) {
        try {
          const { error } = await supabase.from('profiles').insert(profile);
          if (error) throw error;
        } catch (e) {
          console.error('Failed to sync new profile to Supabase:', e);
        }
      }
    }
  };

  const registerUser = async (email: string, fullName: string, role: 'customer' | 'vendor' | 'admin') => {
    let id = `user-${Date.now()}`;
    if (email === 'hemal@gmail.com') id = 'cust-1';
    else if (email === 'vendor@gmail.com') id = 'owner-1';
    else if (email === 'admin@gmail.com') id = 'admin-1';

    const profile: Profile = {
      id,
      email,
      full_name: fullName,
      phone: '+1 555-0199',
      role,
      blocked: false
    };
    setCurrentUser(profile);
    setProfiles(prev => {
      if (!prev.some(p => p.id === profile.id)) {
        return [...prev, profile];
      }
      return prev;
    });

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase.from('profiles').insert(profile);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to sync new profile to Supabase:', e);
      }
    }
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    clearCart();
  };

  const addReview = async (stallId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      user_id: currentUser?.id || 'anonymous',
      stall_id: stallId,
      rating,
      comment,
      created_at: new Date().toISOString(),
      user_name: currentUser?.full_name || 'Anonymous'
    };

    setReviews(prev => [newRev, ...prev]);

    // Calculate new average rating for this stall
    const stallReviews = [newRev, ...reviews].filter(r => r.stall_id === stallId);
    const newAvgRating = parseFloat(
      (stallReviews.reduce((sum, r) => sum + r.rating, 0) / stallReviews.length).toFixed(1)
    );

    // Update local stalls state
    setStalls(prev =>
      prev.map(s => (s.id === stallId ? { ...s, avg_rating: newAvgRating } : s))
    );
    if (selectedStall && selectedStall.id === stallId) {
      setSelectedStall(prev => (prev ? { ...prev, avg_rating: newAvgRating } : null));
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error: reviewError } = await supabase.from('reviews').insert({
          id: newRev.id,
          user_id: currentUser?.id ? currentUser.id : null,
          stall_id: stallId,
          rating,
          comment,
          user_name: newRev.user_name
        });
        if (reviewError) throw reviewError;

        // Update the average rating of the stall in Supabase
        const { error: stallError } = await supabase
          .from('stalls')
          .update({ avg_rating: newAvgRating })
          .eq('id', stallId);
        if (stallError) throw stallError;
      } catch (e) {
        console.error('Failed to sync review and update average rating with Supabase:', e);
      }
    }
  };

  const addFood = async (foodData: Omit<Food, 'id'>): Promise<boolean> => {
    // Count foods added by this stall today (within calendar day)
    const todayStr = new Date().toDateString();
    const todaysAddedFoodsCount = foods.filter(f => {
      if (f.stall_id !== foodData.stall_id) return false;
      if (f.id.startsWith('food-')) {
        const ts = parseInt(f.id.replace('food-', ''));
        if (!isNaN(ts)) {
          return new Date(ts).toDateString() === todayStr;
        }
      }
      return false;
    }).length;

    if (todaysAddedFoodsCount >= 4) {
      alert('Upload Limit Exceeded: You can only upload up to 4 foods per day.');
      return false;
    }

    const newFoodItem: Food = {
      ...foodData,
      id: `food-${Date.now()}`,
    };
    setFoods((prev) => [newFoodItem, ...prev]);

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        await supabase.from('foods').insert(foodData);
      } catch (e: any) {
        console.error('Failed to insert food to Supabase:', e?.message || e, e);
      }
    }
    return true;
  };

  const checkout = async (address: string) => {
    setOrderStatus('pending');

    const subtotal = cart.reduce((acc, item) => acc + (item.food.price * item.quantity), 0);
    const finalDiscount = Math.min(subtotal, discountAmount);
    const total = Math.max(0, subtotal - finalDiscount);

    let orderId = `order-${Date.now()}`;

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: currentUser?.id ? currentUser.id : null,
            total_amount: total,
            delivery_address: address,
            status: 'pending'
          })
          .select()
          .single();

        if (orderError) throw orderError;

        if (orderData) {
          orderId = orderData.id;
          if (cart.length > 0) {
            const itemsToInsert = cart.map(item => ({
              order_id: orderData.id,
              food_id: item.food.id,
              quantity: item.quantity,
              price: item.food.price
            }));

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(itemsToInsert);

            if (itemsError) throw itemsError;
          }
        }
      } catch (e) {
        console.error('Failed to sync order to Supabase:', e);
      }
    }

    // Add new local order for Live Orders feed
    const newOrder: Order = {
      id: orderId,
      user_id: currentUser?.id ? currentUser.id : null,
      total_amount: total,
      status: 'pending',
      delivery_address: address,
      created_at: new Date().toISOString(),
      items: cart.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        order_id: orderId,
        food_id: item.food.id,
        quantity: item.quantity,
        price: item.food.price,
        food_name: item.food.name
      }))
    };
    setOrders((prev) => [newOrder, ...prev]);
    
    // Simulate order progress
    setTimeout(() => setOrderStatus('preparing'), 4000);
    setTimeout(() => setOrderStatus('shipping'), 9000);
    setTimeout(() => setOrderStatus('delivered'), 15000);
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'preparing' | 'shipping' | 'delivered'): Promise<boolean> => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );

    // Also sync active user order timeline status if it corresponds to customer
    setOrderStatus(status);

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to update order status in Supabase:', e?.message || e, e);
      }
    }
    return true;
  };

  const updateStall = async (stallId: string, stallData: Partial<Stall>): Promise<boolean> => {
    setStalls((prev) =>
      prev.map((stall) => (stall.id === stallId ? { ...stall, ...stallData } : stall))
    );

    if (selectedStall && selectedStall.id === stallId) {
      setSelectedStall((prev) => (prev ? { ...prev, ...stallData } : null));
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('stalls')
          .update(stallData)
          .eq('id', stallId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to update stall in Supabase:', e?.message || e, e);
      }
    }
    return true;
  };

  const toggleFoodAvailability = async (foodId: string): Promise<boolean> => {
    let nextAvailability = true;
    setFoods((prev) =>
      prev.map((food) => {
        if (food.id === foodId) {
          nextAvailability = !food.availability;
          return { ...food, availability: nextAvailability };
        }
        return food;
      })
    );

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('foods')
          .update({ availability: nextAvailability })
          .eq('id', foodId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to toggle food availability in Supabase:', e?.message || e, e);
      }
    }
    return true;
  };

  const updateProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
    if (!currentUser) return false;
    const nextUser = { ...currentUser, ...profileData };
    setCurrentUser(nextUser);

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', currentUser.id);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to update profile in Supabase:', e?.message || e, e);
      }
    }
    return true;
  };

  const deleteFood = async (foodId: string): Promise<boolean> => {
    setFoods((prev) => prev.filter((f) => f.id !== foodId));

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('foods')
          .delete()
          .eq('id', foodId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to delete food from Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const detectUserLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setCurrentLocation('Detected Location');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserLocation({ lat: 40.6782, lng: -73.9442 });
        }
      );
    } else {
      setUserLocation({ lat: 40.6782, lng: -73.9442 });
    }
  };

  const addReviewReply = async (reviewId: string, reply: string): Promise<boolean> => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, vendor_reply: reply } : r))
    );

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('reviews')
          .update({ vendor_reply: reply })
          .eq('id', reviewId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to update review reply in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const addComplaint = async (stallId: string, reason: string): Promise<boolean> => {
    const stall = stalls.find(s => s.id === stallId);
    const newComp: Complaint = {
      id: `comp-${Date.now()}`,
      stall_id: stallId,
      stall_name: stall?.name || 'Unknown Stall',
      user_name: currentUser?.full_name || 'Anonymous Customer',
      reason,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setComplaints((prev) => [newComp, ...prev]);

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('complaints')
          .insert({
            id: newComp.id,
            stall_id: stallId,
            stall_name: newComp.stall_name,
            user_name: newComp.user_name,
            reason,
            status: 'pending',
            created_at: newComp.created_at
          });
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to insert complaint in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const toggleFavoriteStall = (stallId: string) => {
    setFavoriteStallIds((prev) =>
      prev.includes(stallId) ? prev.filter((id) => id !== stallId) : [...prev, stallId]
    );
  };

  const toggleFavoriteFood = (foodId: string) => {
    setFavoriteFoodIds((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
  };

  const addVendorPromoCode = async (promo: Omit<VendorPromoCode, 'id'>): Promise<boolean> => {
    const newPromo: VendorPromoCode = {
      ...promo,
      id: `promo-${Date.now()}`,
    };
    setVendorPromoCodes((prev) => [newPromo, ...prev]);

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('vendor_promo_codes')
          .insert({
            id: newPromo.id,
            stall_id: promo.stall_id,
            code: promo.code,
            discount: promo.discount,
            type: promo.type,
            active: promo.active
          });
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to insert vendor promo code in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const togglePromoCodeStatus = async (promoId: string) => {
    let nextActive = true;
    setVendorPromoCodes((prev) =>
      prev.map((p) => {
        if (p.id === promoId) {
          nextActive = !p.active;
          return { ...p, active: nextActive };
        }
        return p;
      })
    );

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('vendor_promo_codes')
          .update({ active: nextActive })
          .eq('id', promoId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to update promo code status in Supabase:', e?.message || e, e);
      }
    }
  };

  const approveVendor = async (stallId: string): Promise<boolean> => {
    setStalls((prev) =>
      prev.map((s) => (s.id === stallId ? { ...s, status: 'approved' } : s))
    );
    if (selectedStall && selectedStall.id === stallId) {
      setSelectedStall((prev) => (prev ? { ...prev, status: 'approved' } : null));
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('stalls')
          .update({ status: 'approved' })
          .eq('id', stallId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to approve vendor in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const suspendVendor = async (stallId: string): Promise<boolean> => {
    setStalls((prev) =>
      prev.map((s) => (s.id === stallId ? { ...s, status: 'suspended' } : s))
    );
    if (selectedStall && selectedStall.id === stallId) {
      setSelectedStall((prev) => (prev ? { ...prev, status: 'suspended' } : null));
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('stalls')
          .update({ status: 'suspended' })
          .eq('id', stallId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to suspend vendor in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const deleteVendor = async (stallId: string): Promise<boolean> => {
    setStalls((prev) => prev.filter((s) => s.id !== stallId));
    if (selectedStall && selectedStall.id === stallId) {
      setSelectedStall(null);
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('stalls')
          .delete()
          .eq('id', stallId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to delete vendor in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const blockUser = async (email: string): Promise<boolean> => {
    setProfiles((prev) =>
      prev.map((p) => (p.email === email ? { ...p, blocked: true } : p))
    );
    if (currentUser && currentUser.email === email) {
      setCurrentUser((prev) => (prev ? { ...prev, blocked: true } : null));
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ blocked: true })
          .eq('email', email);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to block user in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const unblockUser = async (email: string): Promise<boolean> => {
    setProfiles((prev) =>
      prev.map((p) => (p.email === email ? { ...p, blocked: false } : p))
    );
    if (currentUser && currentUser.email === email) {
      setCurrentUser((prev) => (prev ? { ...prev, blocked: false } : null));
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ blocked: false })
          .eq('email', email);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to unblock user in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const resolveComplaint = async (complaintId: string): Promise<boolean> => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status: 'resolved' } : c))
    );

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('complaints')
          .update({ status: 'resolved' })
          .eq('id', complaintId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to resolve complaint in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    ) {
      try {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', reviewId);
        if (error) throw error;
      } catch (e: any) {
        console.error('Failed to delete review in Supabase (succeeding locally):', e?.message || e, e);
      }
    }
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        stalls,
        foods,
        cart,
        reviews,
        vlogs,
        selectedStall,
        selectedFood,
        currentUser,
        isLoading,
        isDarkMode,
        currentLocation,
        promoCode,
        discountAmount,
        orderStatus,
        orders,
        complaints,
        vendorPromoCodes,
        favoriteStallIds,
        favoriteFoodIds,
        userLocation,
        profiles,
        
        setSelectedStall,
        setSelectedFood,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyPromoCode,
        setPromoCode: setPromoCodeState,
        setCurrentLocation,
        toggleTheme,
        loginUser,
        registerUser,
        logoutUser,
        addReview,
        addFood,
        deleteFood,
        checkout,
        setOrderStatus,
        updateStall,
        toggleFoodAvailability,
        updateProfile,
        updateOrderStatus,
        detectUserLocation,
        addReviewReply,
        addComplaint,
        toggleFavoriteStall,
        toggleFavoriteFood,
        addVendorPromoCode,
        togglePromoCodeStatus,
        approveVendor,
        suspendVendor,
        deleteVendor,
        blockUser,
        unblockUser,
        resolveComplaint,
        deleteReview,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
