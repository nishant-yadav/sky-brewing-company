# Query Form System - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Sky Brewing Company Website                  │
│                        (Astro Application)                       │
└─────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────▼────┐   ┌─────▼────┐   ┌───▼──────┐
              │   Home   │   │  About   │   │ Queries  │
              │ /index   │   │ /about   │   │ /queries │◄─── NEW
              └──────────┘   └──────────┘   └────┬─────┘
                                                  │
                                           ┌──────▼──────┐
                                           │  Form Page  │
                                           │   queries   │
                                           │   .astro    │◄─── NEW
                                           └──────┬──────┘
                                                  │
                                    ┌─────────────▼─────────────┐
                                    │  Client-Side Validation   │
                                    │  • Email format           │
                                    │  • Required fields        │
                                    │  • Message length         │
                                    └─────────────┬─────────────┘
                                                  │
                                    ┌─────────────▼─────────────┐
                                    │   Form Submission         │
                                    │   POST /api/submit-query  │◄─── NEW
                                    └─────────────┬─────────────┘
                                                  │
                                    ┌─────────────▼─────────────┐
                                    │  Server-Side Validation   │
                                    │  • Email validation       │
                                    │  • Required field checks  │
                                    │  • Consent verification   │
                                    └─────────────┬─────────────┘
                                                  │
                                    ┌─────────────▼─────────────┐
                                    │   Data Sanitization       │
                                    │  • Remove special chars   │
                                    │  • Trim whitespace        │
                                    └─────────────┬─────────────┘
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                │                                 │                                 │
         ┌──────▼────────┐            ┌──────────▼──────────┐         ┌────────────▼───┐
         │ Google Sheets │            │  Alternative Store  │         │ Fallback Store │
         │  (Primary)    │            │  • Excel Online     │         │  • Local JSON  │
         │               │            │  • Database         │         │  • File system │
         │ (If available)│            │  • MongoDB          │         │  (if primary   │
         └──────┬────────┘            │                     │         │   fails)       │
                │                     └────────┬────────────┘         └────────┬───────┘
                │                              │                              │
                └──────────────────┬───────────┴──────────────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │  API Response   │
                          │  • Success (200)│
                          │  • Error (400+) │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │   User Feedback │
                          │  • Success Msg  │
                          │  • Error Msg    │
                          └────────────────┘
```

---

## Data Flow Diagram

```
USER INTERACTION FLOW
═════════════════════

┌─────────────┐
│  User Visits│
│ /queries    │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Page Loads      │
│  • Form renders  │
│  • Styling loads │
│  • JS attaches   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  User Fills Form │
│  • Name          │
│  • Email         │
│  • Phone         │
│  • Subject       │
│  • Message       │
│  • Company       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  User Reviews &  │
│  • Checks        │
│    Consent box   │
│  • Clicks Submit │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│  CLIENT VALIDATION       │
│  ─────────────────────   │
│  ✓ Name not empty        │
│  ✓ Email valid           │
│  ✓ Subject selected      │
│  ✓ Message 10+ chars     │
│  ✓ Consent checked       │
└──────┬───────────────────┘
       │
       ├─ INVALID ──→ ❌ Show error message
       │
       ├─ VALID ─────────┐
       │                 ▼
       │          ┌──────────────┐
       │          │ Show Loading │
       │          │ State        │
       │          └──────┬───────┘
       │                 │
       │                 ▼
       │          POST /api/submit-query
       │
       └─────────────────┘


SERVER PROCESSING
═════════════════

REQUEST RECEIVED
      │
      ▼
┌─────────────────────────────┐
│  Parse JSON Body            │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  Validate All Fields        │
│  • name (required)          │
│  • email (valid format)     │
│  • subject (required)       │
│  • message (required)       │
│  • consent (required)       │
└─────┬───────────────────────┘
      │
      ├─ INVALID ──→ ❌ Return 400 Error
      │              └─ Error message sent
      │
      ├─ VALID ─────────────┐
      │                     ▼
      │          ┌──────────────────────┐
      │          │ Sanitize Inputs      │
      │          │ • Trim whitespace    │
      │          │ • Remove special     │
      │          │   characters         │
      │          └──────┬───────────────┘
      │                 │
      │                 ▼
      │          ┌──────────────────────┐
      │          │ Build Data Object    │
      │          │ Add timestamp        │
      │          │ Generate ID          │
      │          └──────┬───────────────┘
      │                 │
      │                 ▼
      │          ┌──────────────────────┐
      │          │ Store Data:          │
      │          │ Try Google Sheets    │
      │          └──────┬───────────────┘
      │                 │
      │          ┌──────┴──────┐
      │          │             │
      │    SUCCESS         FAILURE
      │          │             │
      │          │             ▼
      │          │      ┌──────────────┐
      │          │      │ Try Fallback │
      │          │      │ Storage      │
      │          │      └──────┬───────┘
      │          │             │
      │          │      ┌──────┴──────┐
      │          │      │             │
      │          │   SUCCESS      FAILURE
      │          │      │             │
      │          └──────┼─────────────┘
      │                 │
      │                 ▼
      │          ┌──────────────────────┐
      │          │ Generate Response    │
      │          │ • success: true      │
      │          │ • id: query-xxxxx    │
      │          │ • message: "Success" │
      │          └──────┬───────────────┘
      │                 │
      └─────────────────┘
              │
              ▼
       RESPONSE SENT
       (200 OK)


BROWSER RESPONSE
════════════════

RESPONSE RECEIVED
      │
      ▼
┌──────────────────┐
│ Parse Response   │
│ Check Status     │
└──────┬───────────┘
       │
       ├─ SUCCESS (200)      ├─ ERROR (400+)
       │                     │
       ▼                     ▼
  ┌────────────────┐    ┌──────────────┐
  │ Hide Loading   │    │ Hide Loading │
  │ Clear Form     │    │ Show Error   │
  │ Show Success   │    │ Message      │
  │ Message        │    │              │
  │ Hide Error     │    │ Form remains │
  │ Message        │    │ filled       │
  └────────────────┘    └──────────────┘
       │                     │
       ▼                     ▼
   USER SEES           USER SEES
   SUCCESS             ERROR
   MESSAGE             MESSAGE
```

---

## Form Field Validation Flow

```
FORM SUBMISSION
       │
       ▼
┌──────────────────────────────────────┐
│  FIELD: Name                         │
├──────────────────────────────────────┤
│  Validation Steps:                   │
│  1. Is it empty? ──→ FAIL ❌        │
│  2. Length > 2? ──→ FAIL ❌         │
│  3. Length < 100? ──→ FAIL ❌       │
│  4. Letters only? ──→ FAIL ❌       │
│  All pass? ──→ PASS ✅              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  FIELD: Email                        │
├──────────────────────────────────────┤
│  Validation Steps:                   │
│  1. Is it empty? ──→ FAIL ❌        │
│  2. Matches pattern? ──→ FAIL ❌    │
│     (user@domain.com)                │
│  All pass? ──→ PASS ✅              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  FIELD: Phone (Optional)             │
├──────────────────────────────────────┤
│  Validation Steps:                   │
│  1. Is it provided?                  │
│     NO ──→ SKIP (Optional)          │
│     YES ──→ Validate format         │
│  2. Valid pattern? ──→ FAIL ❌      │
│  All pass? ──→ PASS ✅              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  FIELD: Subject                      │
├──────────────────────────────────────┤
│  Validation Steps:                   │
│  1. Is selection empty? ──→ FAIL ❌ │
│  2. Is from allowed? ──→ FAIL ❌   │
│     • Product Inquiry                │
│     • Wholesale Inquiry              │
│     • Subscription                   │
│     • Technical Support              │
│     • General Question               │
│     • Other                          │
│  All pass? ──→ PASS ✅              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  FIELD: Message                      │
├──────────────────────────────────────┤
│  Validation Steps:                   │
│  1. Is it empty? ──→ FAIL ❌        │
│  2. Length >= 10? ──→ FAIL ❌       │
│  3. Length <= 5000? ──→ FAIL ❌     │
│  All pass? ──→ PASS ✅              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  FIELD: Company (Optional)           │
├──────────────────────────────────────┤
│  Validation Steps:                   │
│  1. Is it provided?                  │
│     NO ──→ SKIP (Optional)          │
│     YES ──→ Accept any text         │
│  All pass? ──→ PASS ✅              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  FIELD: Consent Checkbox             │
├──────────────────────────────────────┤
│  Validation Steps:                   │
│  1. Is it checked? ──→ FAIL ❌      │
│  All pass? ──→ PASS ✅              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  ALL FIELDS VALIDATED                │
│  ✅ Form ready to submit            │
└──────────────────────────────────────┘
```

---

## File Structure Tree

```
sky-brewing-company/
│
├── 📄 Core Application Files
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── package.json ◄─── UPDATED
│   ├── postcss.config.cjs
│   └── tailwind.config.cjs
│
├── 🔐 Configuration
│   ├── .env ◄─── CREATE FROM .env.example
│   ├── .env.example ◄─── NEW
│   ├── .gitignore ◄─── UPDATED
│   └── tailwind.config.cjs
│
├── 📁 src/
│   ├── env.d.ts
│   │
│   ├── 📁 pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── queries.astro ◄─── NEW (Form Page)
│   │   │
│   │   └── 📁 api/
│   │       └── submit-query.ts ◄─── NEW (API Handler)
│   │
│   ├── 📁 layouts/
│   │   └── BaseLayout.astro ◄─── UPDATED (Nav Link)
│   │
│   ├── 📁 types/
│   │   └── query.ts ◄─── NEW (TypeScript Types)
│   │
│   ├── 📁 utils/
│   │   └── queryUtils.ts ◄─── NEW (Helper Functions)
│   │
│   └── 📁 styles/
│       └── global.css
│
├── 📁 public/
│   └── 404.html
│
├── 📚 Documentation Files (All NEW)
│   ├── QUICK_REFERENCE.md ◄─── Start here!
│   ├── QUERY_FORM_SETUP.md
│   ├── STORAGE_OPTIONS.md
│   ├── IMPLEMENTATION.md
│   ├── QUERY_FORM_README.md
│   ├── IMPLEMENTATION_COMPLETE.md
│   └── ARCHITECTURE_DIAGRAMS.md (This file)
│
└── 📁 Other Files
    ├── dist/ (Build output)
    ├── node_modules/ (Dependencies)
    └── .git/ (Version control)

Key:
📄 = File
📁 = Directory
◄─── = Points out important additions/changes
NEW = Newly created
UPDATED = Modified existing file
```

---

## Technology Stack

```
┌─────────────────────────────────────┐
│      Sky Brewing Company            │
│     Query Form System                │
└─────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
  FRONTEND   BACKEND   STORAGE
  ────────   ────────  ───────
    │         │         │
    ├─ HTML  ├─ API    ├─ Google Sheets
    ├─ CSS   ├─ Node   ├─ Excel Online
    ├─ JS    ├─ TS     ├─ JSON Files
    │        │         ├─ PostgreSQL
    │        │         └─ MongoDB
    │        │
    └─ Astro ┤
     Framework
       │
    Tailwind CSS
       │
    TypeScript
```

---

## Component Interaction Diagram

```
                  queries.astro
                  (Form Page)
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    HTML Form    Validation    Client Script
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
              Form Events  API Calls  UI Updates
                               │
                               ▼
                    /api/submit-query.ts
                    (API Endpoint)
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
      Validation         Sanitization         Data Processing
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
            appendToGoogleSheets()   Fallback Storage
                    │                     │
                    └─────────┬───────────┘
                              │
                              ▼
                        API Response
                              │
                              ▼
                      Browser Receives
                              │
                              ▼
                      User Sees Result
```

---

## Deployment Architecture

```
LOCAL DEVELOPMENT
══════════════════
   npm run dev
        │
        ▼
   Astro Dev Server
   localhost:3000
        │
   ┌────┴────┐
   │          │
   ▼          ▼
 Browser   Form Processing


PRODUCTION DEPLOYMENT
═════════════════════

┌─────────────────────────────────────┐
│    GitHub Repository                │
│    (Source Code)                    │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Build Step   │ npm run build
    │              │
    │ • Compile    │
    │ • Bundle     │
    │ • Optimize   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Static Files │ (Astro HTML)
    │ + API Routes │ (Serverless)
    └──────┬───────┘
           │
    ┌──────┴──────────────────┐
    │                         │
    ▼                         ▼
 VERCEL              GITHUB PAGES
 (Recommended)       (Static)
    │                    │
    ├─ Hosting           ├─ Hosting
    ├─ Serverless FN     └─ No APIs
    └─ Environment       
       Variables
    
    Both Access:
    │
    ▼
  Google Sheets API
  (External Data)
```

---

**Diagrams created to help visualize the query form system architecture and data flow.**

For more information, see:
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick lookup
- [QUERY_FORM_SETUP.md](QUERY_FORM_SETUP.md) - Setup guide
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical details
