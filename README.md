# Street Eats Hub

A comprehensive web application for finding, reviewing, and ordering from street food vendors. The application features a modern frontend built with Next.js and integrates with various services like Supabase, Cloudinary, and Stripe. It also includes an older Express legacy backend.

## Tech Stack

*   **Frontend**: Next.js (App Router), React, Tailwind CSS
*   **Backend / Database**: Supabase (PostgreSQL)
*   **Media Storage**: Cloudinary
*   **Payments**: Stripe
*   **Legacy API**: Express.js

## Getting Started

### Prerequisites

*   Node.js (version 18 or higher)
*   npm or yarn

### Installation

1.  Install project dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  Set up environment variables. Create a `.env.local` file in the root directory based on the configuration context:
    ```env
    # Cloudinary Configuration
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

    # Stripe Configuration
    STRIPE_SECRET_KEY=your_stripe_secret
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
    ```

3.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

*   `/src/app`: Contains the Next.js App Router pages (admin, dashboard, menu, etc.).
*   `/src/components`: Reusable UI components including maps and specialized views.
*   `/src/lib`: Integrations for core services like Supabase and Cloudinary.
*   `/express_legacy`: Historical Express application and assets.
*   `/supabase_schema.sql`: Database schema definition for Supabase.
