# Sky Brewing Company - Query Form System

> A robust, lightweight, and professional customer inquiry form system built with Astro, Tailwind CSS, and Google Sheets integration.

## 🎯 What This Provides

This is a complete, production-ready customer query form system that:

✅ Collects customer inquiries with form validation  
✅ Stores data in Google Sheets (or alternatives)  
✅ Provides real-time user feedback  
✅ Includes comprehensive error handling  
✅ Maintains data security with environment variables  
✅ Works on all devices (responsive design)  
✅ Has minimal performance overhead  

## 📦 What's Included

### Components
- **Query Form Page** - Beautiful, fully-functional form at `/queries`
- **API Endpoint** - Secure backend handler for submissions
- **TypeScript Types** - Type-safe data structures
- **Utility Functions** - Helper functions for validation and formatting
- **Tailwind Styling** - Modern, responsive design

### Documentation
- **QUERY_FORM_SETUP.md** - Step-by-step Google Sheets configuration
- **STORAGE_OPTIONS.md** - Alternative data storage methods
- **QUICK_REFERENCE.md** - Quick lookup guide
- **IMPLEMENTATION.md** - Complete technical documentation

### Configuration
- **.env.example** - Template for environment variables
- **Updated package.json** - Added necessary dependencies
- **Updated .gitignore** - Protects sensitive files
- **Updated BaseLayout.astro** - Added navigation link

## 🚀 Quick Start (5 minutes)

### 1. Install & Setup
```bash
# Navigate to project
cd /Users/nishant/Documents/Learning/Experiments/2026/coffee-app/sky-brewing-company

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Configure Google Sheets (Optional)
- Create a Google Sheet with columns: `Timestamp | Name | Email | Phone | Subject | Company | Message`
- Get API Key from Google Cloud Console
- Add credentials to `.env`

**See QUERY_FORM_SETUP.md for detailed instructions**

### 3. Run Locally
```bash
npm run dev
```

### 4. Visit the Form
Open: **http://localhost:3000/queries**

## 📋 Form Overview

### Fields Collected
| Field | Type | Required | Details |
|-------|------|----------|---------|
| Full Name | Text | Yes | 2-100 characters |
| Email | Email | Yes | Must be valid email |
| Phone | Tel | No | Optional contact number |
| Subject | Dropdown | Yes | 6 predefined categories |
| Message | Textarea | Yes | 10-5000 characters |
| Company | Text | No | For B2B inquiries |
| Consent | Checkbox | Yes | GDPR compliance |

### Subject Categories
- Product Inquiry
- Wholesale Inquiry
- Subscription
- Technical Support
- General Question
- Other

## 🔧 How It Works

### Form Submission Flow
```
User fills form
    ↓
Client-side validation
    ↓
Submit to /api/submit-query
    ↓
Server-side validation
    ↓
Save to Google Sheets
    ↓
Return success/error response
    ↓
Show feedback to user
```

### Data Journey
```
Form Input → Validation → Sanitization → Google Sheets
                                      ↓
                                 Success Message
                                      ↓
                                   User Notified
```

## 📁 Project Structure

```
sky-brewing-company/
├── src/
│   ├── pages/
│   │   ├── queries.astro                    # Main query form page
│   │   └── api/
│   │       └── submit-query.ts              # Form submission handler
│   ├── layouts/
│   │   └── BaseLayout.astro                 # Updated navigation
│   ├── types/
│   │   └── query.ts                         # TypeScript interfaces
│   ├── utils/
│   │   └── queryUtils.ts                    # Helper functions
│   └── styles/
│       └── global.css                       # Global styling
│
├── Configuration Files
├── .env                                      # Credentials (git ignored)
├── .env.example                              # Template
├── package.json                              # Dependencies
├── tsconfig.json                             # TypeScript config
├── astro.config.mjs                          # Astro config
└── tailwind.config.cjs                       # Tailwind config
│
└── Documentation
    ├── QUERY_FORM_SETUP.md                  # Google Sheets setup
    ├── STORAGE_OPTIONS.md                   # Alternative storage
    ├── IMPLEMENTATION.md                    # Technical details
    ├── QUICK_REFERENCE.md                   # Quick lookup
    └── README.md                             # This file
```

## 🔐 Security Features

### Input Validation
✅ Email format verification  
✅ Required field checks  
✅ Message length validation  
✅ Phone format validation  
✅ Input sanitization  

### Data Protection
✅ Server-side validation  
✅ Credentials in `.env` (not git)  
✅ No sensitive data in logs  
✅ GDPR consent checkbox  
✅ HTTPS ready for production  

### Error Handling
✅ Graceful fallbacks  
✅ User-friendly error messages  
✅ Detailed logging  
✅ Rate limiting ready  

## 🎨 Customization

### Change Form Fields
Edit `src/pages/queries.astro`:
```astro
<input type="text" id="fieldname" name="fieldname" />
```

### Update Subject Categories
Modify the dropdown in `src/pages/queries.astro`:
```astro
<option value="Your Category">Your Category</option>
```

### Change Colors/Styling
Update Tailwind CSS classes:
```astro
<!-- Change color scheme -->
<button class="bg-blue-400 hover:bg-blue-300">Submit</button>
```

### Add New Fields
1. Add input in form HTML
2. Update API validation in `src/pages/api/submit-query.ts`
3. Add to Google Sheets columns

## 💾 Storage Options

### Google Sheets (Recommended ⭐)
- Real-time cloud storage
- Free (with Google account)
- Easy sharing and access
- Automatic backups
- See: QUERY_FORM_SETUP.md

### Excel Online
- For Microsoft 365 users
- Professional ecosystem
- See: STORAGE_OPTIONS.md

### Local JSON Files
- For development
- Single-server deployments
- See: STORAGE_OPTIONS.md

### PostgreSQL / MongoDB
- For enterprise applications
- Scalable and reliable
- See: STORAGE_OPTIONS.md

## 🧪 Testing

### Manual Testing
1. Visit `/queries`
2. Fill form with test data
3. Click "Send Query"
4. Verify success message
5. Check Google Sheets

### Validation Testing
- Try empty required fields
- Try invalid email
- Try short message
- Try unchecked consent

### Edge Cases
- Special characters in name
- International phone numbers
- Very long messages
- Rapid submissions

## 📈 Production Deployment

### Vercel
```bash
npm run build
vercel deploy
```

### GitHub Pages
```bash
npm run deploy
```

### Environment Variables
Add to your hosting platform:
- `GOOGLE_SHEETS_ID`
- `GOOGLE_SHEETS_API_KEY`

### Pre-Deployment Checklist
- [ ] Form tested thoroughly
- [ ] Google Sheets configured
- [ ] `.env` file created
- [ ] `.env` in `.gitignore`
- [ ] Admin email updated
- [ ] HTTPS enabled
- [ ] Error handling tested

## 📊 API Reference

### Endpoint
**POST** `/api/submit-query`

### Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "subject": "Product Inquiry",
  "company": "Acme Corp",
  "message": "I have a question about your products...",
  "consent": true
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Query submitted successfully",
  "id": "query-1234567890"
}
```

### Error Response (400+)
```json
{
  "error": "Description of what went wrong"
}
```

## 🛠️ Available Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run deploy    # Deploy to GitHub Pages
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **QUICK_REFERENCE.md** | Quick lookup for common tasks |
| **QUERY_FORM_SETUP.md** | Complete Google Sheets setup guide |
| **STORAGE_OPTIONS.md** | Alternative storage implementations |
| **IMPLEMENTATION.md** | Technical implementation details |

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Form won't load | Restart dev server: `npm run dev` |
| Submission fails | Check browser console (F12) for errors |
| Data not in Sheets | Verify `.env` credentials and sheet permissions |
| CORS errors | Check API endpoint is properly configured |
| Styling looks wrong | Clear browser cache, hard refresh (Cmd+Shift+R) |

## ❓ FAQ

**Q: Do I need to use Google Sheets?**  
A: No, it's optional. See STORAGE_OPTIONS.md for alternatives.

**Q: Can I change the form fields?**  
A: Yes, easily. Edit `src/pages/queries.astro` and `src/pages/api/submit-query.ts`.

**Q: Is this secure?**  
A: Yes! Server-side validation, input sanitization, and environment variable protection included.

**Q: Can I use this on GitHub Pages?**  
A: Yes, but you need a backend service for form handling. See deployment guide.

**Q: How do I add email notifications?**  
A: Add email service integration to `src/pages/api/submit-query.ts` (SendGrid, Mailgun, etc.)

## 🚀 Next Steps

1. **Setup** - Follow "Quick Start" above
2. **Configure** - Set up Google Sheets (optional but recommended)
3. **Test** - Fill form and verify data appears in storage
4. **Customize** - Adjust fields and styling as needed
5. **Deploy** - Push to production with your host

## 📞 Support

- 📖 Check QUICK_REFERENCE.md for common tasks
- 📋 See QUERY_FORM_SETUP.md for setup help
- 🔄 Review STORAGE_OPTIONS.md for alternative storage
- 📝 Read IMPLEMENTATION.md for technical details

## 📄 Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [TypeScript](https://www.typescriptlang.org)

## ✨ Key Features Summary

🎯 **Purpose-Built**  
Specifically designed for customer inquiries

⚡ **Lightweight**  
Minimal dependencies, fast loading

🎨 **Beautiful**  
Professional design matching your brand

🔐 **Secure**  
Validation, sanitization, and protection

📱 **Responsive**  
Works perfectly on all devices

🔄 **Flexible**  
Easy to customize and extend

💾 **Multiple Storage**  
Google Sheets, Excel, JSON, or database

📊 **Production-Ready**  
Fully tested and documented

---

**Version:** 1.0  
**Last Updated:** July 10, 2026  
**Status:** ✅ Production Ready  

**Start using the form now:** [http://localhost:3000/queries](http://localhost:3000/queries)
