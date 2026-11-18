# Rentlo - Peer-to-Peer Rental Marketplace Platform

Rentlo is a web-based peer-to-peer rental marketplace that connects people who own underused items (cameras, tools, camping equipment, party gear, electronics) with people who need them for short-term use.

---

## 📁 Repository Structure

```
Rentlo/
├── backend/                   # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── configs/           # DB, Cloudinary, Razorpay configurations
│   │   ├── controllers/       # Route request handlers
│   │   ├── middlewares/       # Auth, role check, error handling, upload
│   │   ├── models/            # Mongoose schemas (User, Listing, Booking, etc.)
│   │   ├── routes/            # Express endpoint routers
│   │   ├── services/          # Business logic layer
│   │   └── utils/             # Helpers, custom errors, response wrappers
│   ├── .env.example
│   └── package.json
│
├── frontend/                  # Progressive Web App (PWA) client (React + Vite)
│   ├── public/                # Web manifest, PWA icons, favicon
│   ├── src/
│   │   ├── assets/            # Static imagery and logos
│   │   ├── components/        # Reusable UI components & layouts
│   │   ├── context/           # React context state (Auth, Notifications)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # App views (Explore, Bookings, Dashboard, Admin)
│   │   ├── routes/            # App routing & protected route wrappers
│   │   └── services/          # Axios API communication services
│   ├── index.html
│   └── package.json
│
└── landing/                   # Standalone Marketing & Conversion Landing Page
    ├── public/
    ├── src/
    │   ├── components/        # Hero, How It Works, Categories, Testimonials
    │   ├── App.jsx            # Landing page linking directly to the PWA app
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, Cloudinary, Razorpay
- **Frontend (PWA):** React 18, Vite, Tailwind CSS, React Router, PWA Manifest
- **Landing:** React, Vite, Tailwind CSS (Standalone landing linking to the PWA app)
