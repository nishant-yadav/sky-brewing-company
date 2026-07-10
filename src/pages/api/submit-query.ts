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
  const clientEmail = import.meta.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = import.meta.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId) {
    console.warn('Google Sheets spreadsheet ID not configured');
    console.log('Query data received:', data);
    return;
  }

  const range = 'Sheet1!A:G';
  const timestamp = new Date().toISOString();

  const values = [[timestamp, data.name, data.email, data.phone || 'N/A', data.subject, data.company || 'N/A', data.message]];

  // Preferred: Service Account OAuth (required for write access)
  if (clientEmail && privateKey) {
    // Create JWT and exchange for access token
    try {
      const token = await getServiceAccountAccessToken(clientEmail, privateKey, 'https://www.googleapis.com/auth/spreadsheets');

      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ values, majorDimension: 'ROWS' }),
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
      }

      console.log('Data successfully appended to Google Sheets');
      return;
    } catch (err) {
      console.error('Error appending to Google Sheets:', err);
      throw err;
    }
  }

  // Fallback: API key (read-only for many spreadsheets) — likely to fail for writes
  if (spreadsheetId && apiKey) {
    try {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?key=${apiKey}&valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values, majorDimension: 'ROWS' }),
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
      }

      console.log('Data successfully appended to Google Sheets (apiKey)');
      return;
    } catch (err) {
      console.error('Error appending to Google Sheets with apiKey:', err);
      throw err;
    }
  }

  console.warn('No Google Sheets auth available; falling back to logging');
  console.log('Query data received:', data);
}

// Helper: create a signed JWT and exchange for access token using service account
async function getServiceAccountAccessToken(clientEmail: string, rawPrivateKey: string, scope: string): Promise<string> {
  // private key in env often has escaped newlines
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
  const header = { alg: 'RS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60; // 1 hour
  const claim = {
    iss: clientEmail,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat,
  };

  function base64UrlEncodeString(input: string) {
    if (typeof btoa !== 'undefined') {
      return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    // Node fallback
    return (globalThis as any).Buffer.from(input, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const unsigned = `${base64UrlEncodeString(JSON.stringify(header))}.${base64UrlEncodeString(JSON.stringify(claim))}`;

  // Sign with RSA SHA256 using Node's crypto
  // Use Web Crypto (available in Vercel Edge). Fallbacks use Node globals where available.
  const subtle = (globalThis as any).crypto?.subtle;
  if (!subtle) throw new Error('Web Crypto API not available in this runtime');

  function pemToArrayBuffer(pem: string) {
    // Remove header/footer and newlines
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    // atob in browser, Buffer in node
    let bin: string;
    if (typeof atob !== 'undefined') bin = atob(b64);
    else bin = (globalThis as any).Buffer.from(b64, 'base64').toString('binary');
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  function base64UrlEncode(input: Uint8Array | string) {
    let b64: string;
    if (typeof input === 'string') {
      if (typeof btoa !== 'undefined') b64 = btoa(input);
      else b64 = (globalThis as any).Buffer.from(input, 'utf8').toString('base64');
    } else {
      // Uint8Array -> binary string
      let binary = '';
      for (let i = 0; i < input.length; i++) binary += String.fromCharCode(input[i]);
      if (typeof btoa !== 'undefined') b64 = btoa(binary);
      else b64 = (globalThis as any).Buffer.from(input).toString('base64');
    }
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const alg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as any;
  const pkcs8 = pemToArrayBuffer(privateKey);
  const key = await subtle.importKey('pkcs8', pkcs8, alg, false, ['sign']);
  const encoder = new TextEncoder();
  const signatureArrayBuffer = await subtle.sign(alg, key, encoder.encode(unsigned));
  const signatureUint8 = new Uint8Array(signatureArrayBuffer);
  const signature = base64UrlEncode(signatureUint8);
  const jwt = `${unsigned}.${signature}`;

  const params = new URLSearchParams();
  params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  params.append('assertion', jwt);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to obtain access token: ${res.status} ${res.statusText} ${text}`);
  }

  const body = await res.json();
  if (!body.access_token) throw new Error('No access_token in token response');
  return body.access_token as string;
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

// Provide lowercase alias for runtime compatibility
export const post = POST;
