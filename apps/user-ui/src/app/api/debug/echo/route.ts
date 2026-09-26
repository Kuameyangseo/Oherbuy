import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const headers: Record<string, string | null> = {}
    for (const [k, v] of req.headers.entries()) headers[k] = v
    console.log('[debug/echo] incoming request', { url: req.url, headers })
    return NextResponse.json({ ok: true, url: req.url, headers })
  } catch (err) {
    console.error('[debug/echo] error', err)
    return NextResponse.json({ ok: false, message: 'internal' }, { status: 500 })
  }
}
