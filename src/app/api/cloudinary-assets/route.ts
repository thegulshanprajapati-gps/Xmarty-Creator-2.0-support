import { NextResponse } from 'next/server';

const parseCloudinaryUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return {
      cloudName: parsed.hostname,
      apiKey: parsed.username,
      apiSecret: parsed.password,
    };
  } catch (error) {
    return null;
  }
};

export async function GET() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    return NextResponse.json({ error: 'CLOUDINARY_URL is not configured on the server.' }, { status: 500 });
  }

  const parsed = parseCloudinaryUrl(cloudinaryUrl);
  if (!parsed || !parsed.cloudName || !parsed.apiKey || !parsed.apiSecret) {
    return NextResponse.json({ error: 'Invalid CLOUDINARY_URL format.' }, { status: 500 });
  }

  const { cloudName, apiKey, apiSecret } = parsed;
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?max_results=24`;
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Cloudinary API error: ${response.status} ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ resources: data.resources || [] });
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch Cloudinary assets. ${String(error)}` }, { status: 500 });
  }
}
