# Query Form Setup Guide

## Overview
This document provides complete instructions for setting up the customer query form that integrates with Google Sheets.

## What's Included
- ✅ **Responsive Query Form** (`src/pages/queries.astro`) - Beautiful, accessible form with validation
- ✅ **API Endpoint** (`src/pages/api/submit-query.ts`) - Handles form submissions and Google Sheets integration
- ✅ **Google Sheets Integration** - Automatically saves form data to your Google Sheet
- ✅ **Client-side Validation** - Immediate user feedback with error handling
- ✅ **Fallback Storage** - Works even if Google Sheets isn't configured

## Features
- Collects: Name, Email, Phone, Subject, Message, Company
- Custom subject categories for better organization
- Email validation
- Consent checkbox for GDPR compliance
- Real-time success/error notifications
- Mobile-responsive design with Tailwind CSS
- Lightweight and fast-loading

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Google Sheets Integration (Optional but Recommended)

#### 2a. Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Coffee Shop Queries"
3. Set up headers in the first row:
   ```
   Timestamp | Name | Email | Phone | Subject | Company | Message
   ```

#### 2b. Get Google Sheets API Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (e.g., "Coffee App")
3. Enable the Google Sheets API:
   - Click "Enable APIs and Services"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create an API Key:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy the API Key
5. Get your Spreadsheet ID:
   - Open your Google Sheet
   - The ID is in the URL: `docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Copy the SPREADSHEET_ID part

#### 2c. Make the Sheet Public (Important!)
1. Click "Share" button in the top right
2. Change from "Restricted" to "Public on the web" or "Anyone with the link can view"
3. This allows the API to read and append data

#### 2d. Configure Environment Variables
1. Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. Fill in the values:
   ```
   GOOGLE_SHEETS_ID=your_spreadsheet_id_here
   GOOGLE_SHEETS_API_KEY=your_api_key_here
   ```

### Step 3: Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000/queries` to see the form in action.

### Step 4: Test the Form
1. Fill out the form with test data
2. Submit
3. Check your Google Sheet - the data should appear automatically

## File Structure
```
src/
├── pages/
│   ├── queries.astro           # Main form page with styling and client logic
│   └── api/
│       └── submit-query.ts     # Backend API endpoint for handling submissions
├── layouts/
│   └── BaseLayout.astro        # Updated with link to queries page
└── styles/
    └── global.css              # Global styles (used by form)

Configuration Files:
├── .env.example                # Template for environment variables
├── package.json                # Updated with dotenv dependency
└── astro.config.mjs            # Main Astro configuration
```

## Form Fields Explained

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | Text | Yes | Basic validation |
| Email | Email | Yes | Email format validation |
| Phone | Tel | No | Optional contact number |
| Subject | Select | Yes | Predefined categories |
| Message | Textarea | Yes | Main inquiry content |
| Company | Text | No | For B2B inquiries |
| Consent | Checkbox | Yes | GDPR compliance |

## Subject Categories
- Product Inquiry
- Wholesale Inquiry
- Subscription
- Technical Support
- General Question
- Other

## API Response Format

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
  "error": "Description of the error"
}
```

## Troubleshooting

### Form submissions fail
- ✓ Check browser console for errors (F12 → Console)
- ✓ Verify Google Sheets API credentials in `.env`
- ✓ Ensure the sheet is publicly accessible

### Data not appearing in Google Sheets
- ✓ Check Google Cloud Console for API quota limits
- ✓ Verify the spreadsheet ID is correct
- ✓ Confirm the sheet is set to "public" or "anyone with link"

### API endpoint not found
- ✓ Ensure Astro is configured to handle API routes
- ✓ Check that the file path is `src/pages/api/submit-query.ts`

## Customization Options

### Change Form Fields
Edit `src/pages/queries.astro` and modify the form fields in the HTML section.

### Modify Subject Categories
Update the `<select>` element in the form:
```astro
<option value="Your Category">Your Category</option>
```

### Change Google Sheets Columns
Update the `values` array in `src/pages/api/submit-query.ts` to match your sheet structure.

### Styling
The form uses Tailwind CSS classes. Modify colors and spacing by changing the class names.

## Security Notes

⚠️ **Important:** 
- Never commit `.env` file to version control
- Use a `.gitignore` entry: `echo ".env" >> .gitignore`
- API keys should be kept private
- Consider rate limiting in production
- Add CSRF protection if needed

## Production Deployment

### With Vercel
```bash
npm run build
vercel deploy
```

### With GitHub Pages
```bash
npm run deploy
```

### Environment Variables
Set `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_API_KEY` in your hosting platform's secrets/environment variables.

## Advanced Features (Optional)

### Add Email Notifications
Create a webhook or email service integration in the API endpoint.

### Database Storage
Replace Google Sheets with a database (PostgreSQL, MongoDB, etc.) for better scalability.

### Rate Limiting
Add rate limiting middleware to prevent spam submissions.

### Form Analytics
Track submission metrics and user behavior.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the Astro documentation: https://docs.astro.build
3. Check Google Sheets API docs: https://developers.google.com/sheets/api

---

**Last Updated:** July 2026  
**Astro Version:** 2.6.5+
