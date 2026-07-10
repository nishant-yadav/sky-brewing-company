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

  const base64abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  function encodeBase64(bytes: Uint8Array) {
    let base64 = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const chunk = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
      base64 += base64abc[(chunk >> 18) & 0x3f];
      base64 += base64abc[(chunk >> 12) & 0x3f];
      base64 += i + 1 < bytes.length ? base64abc[(chunk >> 6) & 0x3f] : '=';
      base64 += i + 2 < bytes.length ? base64abc[chunk & 0x3f] : '=';
    }
    return base64;
  }

  function base64UrlEncodeString(input: string) {
    const bytes = new TextEncoder().encode(input);
    return encodeBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const unsigned = `${base64UrlEncodeString(JSON.stringify(header))}.${base64UrlEncodeString(JSON.stringify(claim))}`;

  // Sign with RSA SHA256 using the Web Crypto API in Edge.
  const subtle = (globalThis as any).crypto?.subtle;
  if (!subtle) throw new Error('Web Crypto API not available in this runtime');

  function base64UrlEncode(bytes: Uint8Array) {
    return encodeBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64UrlToUint8Array(base64: string) {
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(padLength);

    let binary: string;
    if (typeof atob !== 'undefined') {
      binary = atob(padded);
    } else {
      const base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      const lookup = new Uint8Array(256);
      for (let i = 0; i < base64chars.length; i++) lookup[base64chars.charCodeAt(i)] = i;
      const len = padded.length;
      const bytes = [] as number[];
      let buffer = 0;
      let bits = 0;
      for (let i = 0; i < len; i++) {
        const ch = padded.charCodeAt(i);
        if (ch === 61) break;
        const value = lookup[ch];
        buffer = (buffer << 6) | value;
        bits += 6;
        if (bits >= 8) {
          bits -= 8;
          bytes.push((buffer >> bits) & 0xff);
        }
      }
      binary = String.fromCharCode(...bytes);
    }

    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function pemToArrayBuffer(pem: string) {
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    return base64UrlToUint8Array(b64).buffer;
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
