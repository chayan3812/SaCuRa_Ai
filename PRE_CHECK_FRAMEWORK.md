# ⚙️ UNIVERSAL FULL PRE-CHECK LOGIC FRAMEWORK

**MANDATORY: Apply this framework before ANY code changes**

## ✅ Pre-Implementation Checklist

### 1. Existing Component Analysis
- [ ] Check `client/src/pages/` for existing page components
- [ ] Check `client/src/components/` for existing UI components  
- [ ] Check `server/routes.ts` for existing API endpoints
- [ ] Check `server/modules/` for existing services
- [ ] Check `shared/schema.ts` for existing data models
- [ ] Check `storage.ts` for existing database operations

### 2. Duplication Prevention
- [ ] **DO NOT CREATE** if feature already exists
- [ ] **ENHANCE EXISTING** instead of duplicating
- [ ] **MARK ENHANCEMENTS** with: `// 👁️ Enhanced by AI on [date] — Feature: [Name]`

### 3. Data Integrity Verification
- [ ] Replace dummy/mock data with real API calls
- [ ] Ensure all data sources are authentic
- [ ] Verify database queries return real data
- [ ] **NEVER** assume mock data needs to stay

### 4. File System Hygiene
- [ ] Ignore `*_backup.tsx` or broken versions
- [ ] Work only with production files
- [ ] Clean up unused imports
- [ ] Remove orphaned files

### 5. Database Integration Standards
- [ ] Use Drizzle ORM in `shared/schema.ts`
- [ ] Update `storage.ts` with new operations
- [ ] Ensure type consistency across frontend/backend
- [ ] Run `npm run db:push` after schema changes

### 6. API Integration Standards
- [ ] Register new routes in `server/routes.ts`
- [ ] Follow existing pattern: `router.get(...)`, `router.post(...)`
- [ ] **DO NOT** create separate router files
- [ ] Maintain consistent error handling

### 7. Frontend Integration Standards
- [ ] Ensure route exists in `client/src/App.tsx`
- [ ] Add to Sidebar navigation if user-facing
- [ ] Skip sidebar for internal/background features
- [ ] Maintain responsive design patterns

### 8. Production Readiness Verification
- [ ] All logic is live-wired and functional
- [ ] No mock data remaining
- [ ] No duplicate files created
- [ ] No unaddressed TODO comments
- [ ] TypeScript compilation successful
- [ ] All imports resolve correctly

## 🎯 Current Platform Status

### ✅ Verified Working Features
- **Authentication System**: Replit Auth with session management
- **Dashboard**: Responsive with real-time metrics
- **AI Engines**: Active with continuous learning
- **Facebook Integration**: API services with error handling
- **Database**: PostgreSQL with Drizzle ORM
- **Responsive Design**: Mobile-first with proper navigation

### 🔧 Available Services
- `advancedAIEngine.ts` - AI insights and predictions
- `facebook.ts` - Facebook Graph API integration
- `pageWatcher.ts` - Real-time page monitoring
- `contentScheduler.ts` - Automated content posting
- `mlEngine.ts` - Machine learning capabilities
- `hybridAI.ts` - Advanced AI processing

### 📁 Established Architecture
```
client/src/
├── components/     # Reusable UI components
├── pages/         # Route-based pages
├── hooks/         # Custom React hooks
└── lib/           # Utilities

server/
├── routes.ts      # API endpoints
├── storage.ts     # Database operations
├── db.ts         # Database configuration
└── [services]/   # AI and integration services

shared/
└── schema.ts     # Centralized data models
```

## ⚡ Ready for Feature Implementation

Use this framework with any new feature request:
> ➤ Let's implement [FeatureName] (with full pre-check)

The system will automatically apply this framework before making any changes.