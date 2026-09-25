"use client"
import React, { useEffect, useState, useRef } from 'react'
import axiosInstance from 'apps/seller-ui/src/utils/axiosinstance'

type Status = 'unknown' | 'healthy' | 'unreachable'

export default function ApiHealthBanner() {
  const [status, setStatus] = useState<Status>('unknown')
  const [message, setMessage] = useState<string>('Checking API...')
  const intervalRef = useRef<number | null>(null)

  const check = async () => {
    try {
      // Ping gateway health endpoint (exists on the gateway)
      const res = await axiosInstance.get('/gateway-health', { timeout: 3000 })
      if (res && res.status >= 200 && res.status < 300) {
        setStatus('healthy')
        setMessage('API reachable')
      } else {
        setStatus('unreachable')
        setMessage(`Unhealthy response: ${res?.status || 'no status'}`)
      }
    } catch (err: any) {
      setStatus('unreachable')
      const cfg = err?.config || {}
      const base = cfg?.baseURL || axiosInstance.defaults.baseURL
      const url = cfg?.url || '/gateway-health'
      setMessage(`Cannot reach API at ${base}${url}: ${err?.message || 'network error'}`)
    }
  }

  useEffect(() => {
    check()
    intervalRef.current = window.setInterval(check, 15000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'unknown') return null

  return (
    <div className={`w-full mb-4 rounded p-2 text-sm ${status === 'healthy' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <strong>{status === 'healthy' ? 'API OK' : 'API Unreachable'}</strong>
          <span className="ml-2">{message}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs underline" onClick={() => { setStatus('unknown'); setMessage('Checking API...'); check() }}>Retry</button>
        </div>
      </div>
    </div>
  )
}
