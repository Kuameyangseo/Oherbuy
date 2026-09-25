import { NextResponse } from 'next/server'

/**
 * Proxy POST /api/orders to the backend API gateway so the backend
 * handles order creation and email sending (avoids frontend sending SMTP directly).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URI || 'http://localhost:8080'
    // Call the API gateway /orders path so the gateway maps to the correct
    // order-service endpoint (POST /api/create-order).
    const target = `${apiBase.replace(/\/$/, '')}/orders`

    console.debug('[api/orders] proxying order POST to', target)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(req.headers.get('authorization') ? { Authorization: req.headers.get('authorization')! } : {}),
    }
    // Forward cookie header if present so backend can authenticate via session cookie
    const cookie = req.headers.get('cookie')
    if (cookie) headers['cookie'] = cookie

    const r = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const text = await r.text()
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: r.status })
    } catch (_) {
      // non-JSON response
      return new NextResponse(text, { status: r.status })
    }
  } catch (err: any) {
    console.error('[api/orders] proxy error', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 502 })
  }
}

export async function GET(req: Request) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URI || 'http://localhost:8080'
    const target = `${apiBase.replace(/\/$/, '')}/orders`
    const headers: Record<string, string> = {
      ...(req.headers.get('authorization') ? { Authorization: req.headers.get('authorization')! } : {}),
    }
    const cookie = req.headers.get('cookie')
    if (cookie) headers['cookie'] = cookie

    const r = await fetch(target, { method: 'GET', headers })
    const text = await r.text()
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: r.status })
    } catch (_) {
      return new NextResponse(text, { status: r.status })
    }
  } catch (err: any) {
    console.error('[api/orders] proxy GET error', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 502 })
  }
}
