# Quick Reference Card

## Form Access
🌐 **URL:** `http://localhost:3000/queries` (local) or `/queries` (production)

## Files Modified/Created

### New Files
- ✨ `src/pages/queries.astro` - Main form page
- ✨ `src/pages/api/submit-query.ts` - API handler
- ✨ `src/types/query.ts` - TypeScript types
- ✨ `.env.example` - Environment template
- ✨ `QUERY_FORM_SETUP.md` - Setup guide
- ✨ `STORAGE_OPTIONS.md` - Storage alternatives
- ✨ `IMPLEMENTATION.md` - Complete documentation

### Modified Files
- 📝 `src/layouts/BaseLayout.astro` - Added queries link to nav
- 📝 `package.json` - Added dotenv dependency
- 📝 `.gitignore` - Added .env and query data

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

## Google Sheets Setup (5 min)

1. Create Google Sheet with headers
2. Get API Key from Google Cloud Console
3. Copy spreadsheet ID from URL
4. Add to `.env`:
   ```
   GOOGLE_SHEETS_ID=your_id
   GOOGLE_SHEETS_API_KEY=your_key
   ```
5. Make sheet public/shareable

See `QUERY_FORM_SETUP.md` for detailed steps.

## Form Fields

- **Name** ✅ required
- **Email** ✅ required (email validation)
- **Phone** ❌ optional
- **Subject** ✅ required (dropdown)
- **Message** ✅ required (textarea)
- **Company** ❌ optional
- **Consent** ✅ required (checkbox)

## Subject Options

- Product Inquiry
- Wholesale Inquiry
- Subscription
- Technical Support
- General Question
- Other

## API Endpoint

**POST** `/api/submit-query`

### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555-1234",
  "subject": "Product Inquiry",
  "company": "Acme Corp",
  "message": "Your message here",
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

### Error Response (400/500)
```json
{
  "error": "Error description"
}
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| 404 on `/queries` | Restart dev server |
| Form won't submit | Check browser console for errors |
| No data in Sheets | Verify `.env` credentials |
| CORS error | Check API endpoint configuration |
| Form looks off | Clear browser cache |

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run deploy       # Deploy to GitHub Pages
```

## Styling (Tailwind)

Edit form appearance by changing Tailwind classes:
- Colors: `bg-amber-400`, `text-slate-100`
- Spacing: `px-6`, `py-3`, `gap-4`
- Responsiveness: `sm:`, `md:`, `lg:` prefixes

## Validation Rules

| Field | Min | Max | Pattern |
|-------|-----|-----|---------|
| Name | 2 | 100 | Letters, spaces, hyphens |
| Email | - | - | Valid email |
| Message | 10 | 5000 | Any text |
| Phone | - | - | Digits, spaces, symbols |

## Adding New Fields

1. Add to form in `src/pages/queries.astro`:
   ```astro
   <input type="text" id="newfield" name="newfield" />
   ```

2. Update API in `src/pages/api/submit-query.ts`:
   - Add to QueryData interface
   - Add validation if needed
   - Add to Google Sheets values array

3. Update types in `src/types/query.ts`:
   - Add to QueryFormData interface
   - Add validation rules if needed

## Storage Options

- **Google Sheets** (recommended) - Real-time cloud
- **Excel Online** - Microsoft 365 integration
- **JSON Files** - Local development
- **PostgreSQL** - Enterprise databases
- **MongoDB** - Flexible schemas

See `STORAGE_OPTIONS.md` for implementation code.

## Customization Checklist

- [ ] Update form colors to match brand
- [ ] Change subject categories
- [ ] Add/remove form fields
- [ ] Customize success/error messages
- [ ] Update navigation branding
- [ ] Change email address in footer
- [ ] Configure Google Sheets or alternative storage
- [ ] Test on mobile devices
- [ ] Deploy to production

## Environment Variables

Create `.env` from `.env.example`:

```bash
# Required for Google Sheets
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SHEETS_API_KEY=your_api_key

# Optional
ADMIN_EMAIL=admin@example.com
```

**⚠️ Never commit `.env` to git!**

## Testing Checklist

- [ ] Form loads on `/queries`
- [ ] All validation works
- [ ] Success message appears
- [ ] Data appears in Google Sheets
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Navigation link works
- [ ] Styling looks good

## Performance Tips

✅ Form is lightweight (minimal JavaScript)  
✅ Uses async/await for non-blocking UI  
✅ Client-side validation before submission  
✅ Server-side validation for security  

## Security Reminders

🔒 Never expose API keys in code  
🔒 Use `.env` for credentials  
🔒 Validate all inputs server-side  
🔒 Implement rate limiting in production  
🔒 Use HTTPS for production  

## Production Checklist

- [ ] `.env` configured with real credentials
- [ ] `.env` in `.gitignore`
- [ ] Form tested thoroughly
- [ ] Google Sheets configured
- [ ] Admin email updated
- [ ] HTTPS enabled
- [ ] Rate limiting added (optional)
- [ ] Analytics configured (optional)
- [ ] Email notifications set up (optional)

## Need Help?

📖 Full docs: See `QUERY_FORM_SETUP.md`  
🔄 Storage options: See `STORAGE_OPTIONS.md`  
📋 Complete guide: See `IMPLEMENTATION.md`  

---

**Quick Start:** 
```bash
npm install && cp .env.example .env && npm run dev
```

Visit: http://localhost:3000/queries ✨
