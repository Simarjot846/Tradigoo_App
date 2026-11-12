# 🏗️ Tradigoo Architecture

## Project Structure

```
Tradigoo_Live/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── cart/                 # Cart management
│   │   ├── orders/               # Order management
│   │   ├── payments/             # Payment processing
│   │   └── pathway-*/            # Pathway real-time endpoints
│   ├── auth/                     # Auth pages (login, signup)
│   ├── dashboard/                # Dashboard pages
│   ├── marketplace/              # Product marketplace
│   ├── cart/                     # Shopping cart
│   ├── order/                    # Order pages
│   └── profile/                  # User profile
│
├── components/                   # React Components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── buyer-dashboard.tsx   # Retailer dashboard
│   │   ├── seller-dashboard.tsx  # Wholesaler dashboard
│   │   ├── LiveSearchTrends.tsx  # Real-time search tracking
│   │   ├── LiveWeatherWidget.tsx # Weather intelligence
│   │   └── ...                   # Other dashboard components
│   ├── auth/                     # Authentication components
│   ├── shared/                   # Shared components
│   └── ui/                       # shadcn/ui components
│
├── lib/                          # Utilities & Helpers
│   ├── supabase-client.ts        # Supabase client
│   ├── auth-context.tsx          # Auth context provider
│   ├── cart-context.tsx          # Cart state management
│   ├── constants.ts              # App constants
│   └── utils/                    # Utility functions
│       ├── format.ts             # Formatting utilities
│       └── validation.ts         # Validation utilities
│
├── types/                        # TypeScript Types
│   ├── index.ts                  # Central type exports
│   ├── dashboard.ts              # Dashboard types
│   ├── products.ts               # Product types
│   ├── orders.ts                 # Order types
│   └── users.ts                  # User types
│
├── pathway-backend/              # Pathway Streaming Backend
│   ├── pathway_realtime.py       # Main Pathway pipeline
│   ├── requirements.txt          # Python dependencies
│   ├── start_pathway.bat         # Windows starter
│   ├── start_pathway.sh          # Mac/Linux starter
│   └── README.md                 # Backend docs
│
├── docs/                         # Documentation
│   ├── setup/                    # Setup guides
│   ├── features/                 # Feature documentation
│   ├── architecture/             # Architecture docs
│   ├── troubleshooting/          # Troubleshooting guides
│   ├── hackathon/                # Hackathon submission
│   └── README.md                 # Docs index
│
├── public/                       # Static assets
│   ├── images/                   # Images
│   └── icons/                    # Icons
│
├── .github/                      # GitHub configuration
│   ├── workflows/                # CI/CD workflows
│   └── PULL_REQUEST_TEMPLATE.md  # PR template
│
└── Configuration Files
    ├── next.config.ts            # Next.js config
    ├── tsconfig.json             # TypeScript config
    ├── tailwind.config.ts        # Tailwind config
    ├── eslint.config.mjs         # ESLint config
    ├── package.json              # Dependencies
    └── .env.local                # Environment variables
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Data Fetching**: React Query
- **Charts**: Recharts

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Pathway streaming framework
- **API**: FastAPI (Python)

### AI & ML
- **LLM**: Google Gemini 1.5 Pro
- **Weather API**: OpenWeatherMap
- **Streaming**: Pathway

### Payment
- **Gateway**: Razorpay
- **Escrow**: Custom implementation

## Data Flow

### 1. Real-Time Data Pipeline (Pathway)
```
OpenWeatherMap API
        ↓
Pathway Backend (Python)
  • Weather streaming (5 min)
  • Search tracking (real-time)
  • Statistics updates (2 sec)
        ↓
FastAPI Endpoints (Port 8081)
        ↓
Next.js API Routes
        ↓
React Components
        ↓
User Dashboard
```

### 2. Order Flow
```
User → Cart → Checkout → Payment (Razorpay)
                              ↓
                         Escrow Vault
                              ↓
                    Seller Ships Order
                              ↓
                    QR Code + OTP Verification
                              ↓
                    24hr Inspection Window
                              ↓
                    Payment Released to Seller
```

### 3. Authentication Flow
```
User → Login/Signup → Supabase Auth
                           ↓
                      JWT Token
                           ↓
                    Auth Context
                           ↓
                  Protected Routes
```

## Key Design Patterns

### 1. Component Organization
- **Atomic Design**: UI components follow atomic design principles
- **Feature-based**: Dashboard components grouped by feature
- **Shared Components**: Reusable components in `/components/shared`

### 2. Type Safety
- **Centralized Types**: All types in `/types` directory
- **Type Exports**: Single import point via `/types/index.ts`
- **Strict TypeScript**: No `any` types allowed

### 3. Code Reusability
- **Utility Functions**: Centralized in `/lib/utils`
- **Constants**: App-wide constants in `/lib/constants.ts`
- **Custom Hooks**: Reusable hooks in `/lib/hooks`

### 4. Performance Optimization
- **Lazy Loading**: Heavy components loaded on-demand
- **Polling Optimization**: Reduced API calls by 60-70%
- **Memoization**: React.memo for expensive components
- **Code Splitting**: Automatic with Next.js

## Security Measures

1. **Authentication**: JWT-based with Supabase
2. **Authorization**: Row Level Security (RLS) in database
3. **Input Validation**: All inputs sanitized
4. **API Security**: Rate limiting, CORS, HTTPS only
5. **Payment Security**: PCI-compliant via Razorpay
6. **Escrow Protection**: Cryptographic verification

## Deployment

### Frontend (Vercel)
- Automatic deployments from `main` branch
- Environment variables configured
- Edge functions for API routes

### Backend (Pathway)
- Deployed on dedicated server
- FastAPI with Uvicorn
- Background tasks for streaming

### Database (Supabase)
- Managed PostgreSQL
- Automatic backups
- Real-time subscriptions

## Monitoring & Analytics

- **Error Tracking**: Sentry (planned)
- **Analytics**: Mixpanel (planned)
- **Performance**: Vercel Analytics
- **Logs**: Supabase logs + FastAPI logs

---

**For detailed setup instructions, see [docs/README.md](docs/README.md)**
