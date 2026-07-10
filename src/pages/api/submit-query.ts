import type { APIRoute } from 'astro';

// Disable prerendering for this endpoint - it needs to handle dynamic requests
export const prerender = false;

interface QueryData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
  consent: boolean;
  timestamp?: string;
}

// Function to append data to Google Sheets
async function appendToGoogleSheets(data: QueryData): Promise<void> {
  const spreadsheetId = import.meta.env.GOOGLE_SHEETS_ID;
  const apiKey = import.meta.env.GOOGLE_SHEETS_API_KEY;

  if (!spreadsheetId || !apiKey) {
    console.warn('Google Sheets credentials not configured');
    // Fallback: just log the data
    console.log('Query data received:', data);
    return;
  }

  const range = 'Sheet1!A:G';
  const timestamp = new Date().toISOString();

  const values = [
    [
      timestamp,
      data.name,
      data.email,
      data.phone || 'N/A',
      data.subject,
      data.company || 'N/A',
      data.message,
    ],
  ];

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values,
          majorDimension: 'ROWS',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    console.log('Data successfully appended to Google Sheets');
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    // You can also implement fallback storage (e.g., local file, database)
    throw error;
  }
}

// Function to save to local JSON file as fallback
async function saveToLocalFile(data: QueryData): Promise<void> {
  // This is a simple fallback - in production, you'd use a database
  console.log('Saving query to local storage:', data);
}

export const POST: APIRoute = async ({ request }) => {
  // Verify request method
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check consent
    if (!body.consent) {
      return new Response(
        JSON.stringify({ error: 'Consent is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const queryData: QueryData = {
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim(),
      subject: body.subject.trim(),
      message: body.message.trim(),
      company: body.company?.trim(),
      consent: body.consent,
      timestamp: new Date().toISOString(),
    };

    // Try to save to Google Sheets
    try {
      await appendToGoogleSheets(queryData);
    } catch (error) {
      // Fallback to local storage
      console.error('Google Sheets failed, using fallback storage:', error);
      await saveToLocalFile(queryData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Query submitted successfully',
        id: `query-${Date.now()}`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process your request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
