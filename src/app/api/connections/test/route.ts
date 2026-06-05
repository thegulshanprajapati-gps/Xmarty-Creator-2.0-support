import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { service } = await request.json();

    switch (service) {
      case 'supabase': {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
          return NextResponse.json(
            { error: 'Missing Supabase environment variables' },
            { status: 400 }
          );
        }

        try {
          const response = await fetch(`${url}/rest/v1/`, {
            headers: {
              apikey: key,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            return NextResponse.json({ status: 'connected', service });
          } else {
            return NextResponse.json(
              { error: 'Supabase API returned error', status: response.status },
              { status: 400 }
            );
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to reach Supabase API', details: String(error) },
            { status: 500 }
          );
        }
      }

      case 'database': {
        const url = process.env.DATABASE_URL;

        if (!url) {
          return NextResponse.json(
            { error: 'DATABASE_URL not configured' },
            { status: 400 }
          );
        }

        try {
          // Note: Actual database connection would require a database client
          // For now, we'll validate the connection string format
          if (url.startsWith('postgresql://')) {
            return NextResponse.json({ status: 'configured', service });
          } else {
            return NextResponse.json(
              { error: 'Invalid DATABASE_URL format' },
              { status: 400 }
            );
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to validate database connection', details: String(error) },
            { status: 500 }
          );
        }
      }

      case 'cloudinary': {
        const url = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
        const gallery = process.env.NEXT_PUBLIC_CLOUDINARY_GALLERY_URL;

        if (!url && !gallery) {
          return NextResponse.json(
            { error: 'Cloudinary not configured' },
            { status: 400 }
          );
        }

        if (gallery) {
          try {
            const response = await fetch(gallery, { method: 'HEAD' });
            if (response.ok || response.status === 401 || response.status === 403) {
              return NextResponse.json({ status: 'connected', service });
            }
          } catch (error) {
            return NextResponse.json(
              { error: 'Failed to reach Cloudinary', details: String(error) },
              { status: 500 }
            );
          }
        }

        return NextResponse.json({ status: 'configured', service });
      }

      case 'firebase': {
        const config = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

        if (!config) {
          return NextResponse.json(
            { error: 'Firebase not configured' },
            { status: 400 }
          );
        }

        return NextResponse.json({ status: 'legacy', service });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown service' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
