# Alternative: Excel & Local Storage Guide

This guide explains how to use Excel or local file storage as alternatives to Google Sheets.

## Option 1: Google Sheets (Recommended)
**Pros:** Real-time updates, cloud-based, free, shareable  
**Cons:** Requires API setup

See `QUERY_FORM_SETUP.md` for full setup instructions.

---

## Option 2: Excel Online with OneDrive API

### Setup Steps

1. **Create Excel File on OneDrive**
   - Go to office.com
   - Create a new Excel file
   - Add headers: `Timestamp | Name | Email | Phone | Subject | Company | Message`

2. **Get OneDrive API Credentials**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create an app registration
   - Get client ID and secret
   - Request permissions for Excel API

3. **Update .env**
   ```
   ONEDRIVE_CLIENT_ID=your_client_id
   ONEDRIVE_CLIENT_SECRET=your_client_secret
   ONEDRIVE_FILE_ID=your_file_id
   ```

4. **Modify API Endpoint**
   Replace the Google Sheets code in `src/pages/api/submit-query.ts` with:

```typescript
async function appendToExcelOneDrive(data: QueryData): Promise<void> {
  const clientId = import.meta.env.ONEDRIVE_CLIENT_ID;
  const clientSecret = import.meta.env.ONEDRIVE_CLIENT_SECRET;
  const fileId = import.meta.env.ONEDRIVE_FILE_ID;

  if (!clientId || !clientSecret || !fileId) {
    throw new Error('OneDrive credentials not configured');
  }

  // Get access token
  const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'https://graph.microsoft.com/.default',
    }).toString(),
  });

  const { access_token } = await tokenResponse.json();

  // Append to Excel
  const timestamp = new Date().toISOString();
  const rowData = {
    values: [[
      timestamp,
      data.name,
      data.email,
      data.phone || 'N/A',
      data.subject,
      data.company || 'N/A',
      data.message,
    ]],
  };

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/tables/Table1/rows/add`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rowData),
    }
  );

  if (!response.ok) {
    throw new Error(`Excel API error: ${response.statusText}`);
  }
}
```

---

## Option 3: Local JSON File Storage

**Pros:** No external dependencies, works offline, simple setup  
**Cons:** Limited to single server, no real-time sharing

### Setup Steps

1. **Create queries directory**
   ```bash
   mkdir -p src/data
   ```

2. **Modify API endpoint** in `src/pages/api/submit-query.ts`:

```typescript
import fs from 'fs/promises';
import path from 'path';

async function saveToJSONFile(data: QueryData): Promise<void> {
  const dataDir = path.join(process.cwd(), 'src', 'data');
  const filePath = path.join(dataDir, 'queries.json');

  try {
    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Read existing queries
    let queries = [];
    try {
      const existing = await fs.readFile(filePath, 'utf-8');
      queries = JSON.parse(existing);
    } catch {
      // File doesn't exist yet
      queries = [];
    }

    // Add new query
    queries.push({
      ...data,
      id: `query-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(queries, null, 2));
    console.log('Query saved to JSON file');
  } catch (error) {
    console.error('Error saving to JSON file:', error);
    throw error;
  }
}
```

3. **Export queries endpoint** (optional)

Add this new file: `src/pages/api/queries.ts`

```typescript
import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async () => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'queries.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const queries = JSON.parse(data);

    return new Response(JSON.stringify(queries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'No queries found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

Access queries at: `/api/queries`

---

## Option 4: Database Storage

### PostgreSQL Example

1. **Install dependencies**
   ```bash
   npm install pg
   ```

2. **Create database**
   ```sql
   CREATE TABLE queries (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     phone VARCHAR(20),
     subject VARCHAR(100) NOT NULL,
     company VARCHAR(255),
     message TEXT NOT NULL,
     consent BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Update API endpoint** in `src/pages/api/submit-query.ts`:

```typescript
import { Client } from 'pg';

async function saveToDB(data: QueryData): Promise<void> {
  const client = new Client({
    connectionString: import.meta.env.DATABASE_URL,
  });

  try {
    await client.connect();

    await client.query(
      `INSERT INTO queries (name, email, phone, subject, company, message, consent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.name,
        data.email,
        data.phone,
        data.subject,
        data.company,
        data.message,
        data.consent,
      ]
    );
  } finally {
    await client.end();
  }
}
```

---

## Comparison Table

| Method | Setup Difficulty | Real-time | Cost | Best For |
|--------|------------------|-----------|------|----------|
| Google Sheets | Easy | Yes | Free | Small projects, quick setup |
| Excel Online | Medium | Yes | Free (Office 365) | Teams using Microsoft products |
| JSON Files | Very Easy | No | Free | Development, single server |
| PostgreSQL | Hard | Yes | $$ | Scalable applications |
| MongoDB | Hard | Yes | $ | Flexible schema needs |

---

## Security Best Practices

- ✅ Use `.env` files for credentials
- ✅ Never commit `.env` to git
- ✅ Validate all inputs server-side
- ✅ Rate limit API endpoints
- ✅ Use HTTPS in production
- ✅ Add CORS restrictions if needed
- ✅ Encrypt sensitive data

---

## Migration Guide

To switch from Google Sheets to another method:

1. Backup existing data
2. Update the `appendToGoogleSheets()` function call in the API endpoint
3. Add new storage function (e.g., `saveToJSONFile()`, `saveToDB()`)
4. Test with a sample submission
5. Update `.env` file with new credentials (if needed)

---

Need help? Check `QUERY_FORM_SETUP.md` for more details on the Google Sheets integration.
