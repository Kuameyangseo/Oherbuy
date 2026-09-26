"use client"
import React, { useEffect, useState } from 'react'
import useSeller from 'apps/seller-ui/src/hooks/useSeller'
import ImagePlaceHolder from 'apps/seller-ui/src/share/components/image-placeholder'
import axiosInstance from 'apps/seller-ui/src/utils/axiosinstance'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

// Use the shared axios instance (gateway-aware) for shop API calls so cookies are sent reliably

export default function SettingsPage() {
  const { seller, isLoading } = useSeller()
  const shopId = (seller as any)?.shop?.id || (seller as any)?.shopId || null
  const { register, handleSubmit, setValue, watch } = useForm()
  const [loading, setLoading] = useState(false)
  const [cover, setCover] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [imagesState, setImagesState] = useState<any[]>([null, null])
  const router = useRouter()
  const queryClient = useQueryClient()
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!shopId) return
      try {
        // Use axiosInstance so we hit the API gateway and include credentials
        // Retry transient 429 responses a few times to avoid hitting gateway concurrency limits
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
        const axiosRetry = async (fn: () => Promise<any>, attempts = 3, baseDelay = 300) => {
          let lastErr: any
          for (let i = 0; i < attempts; i++) {
            try {
              return await fn()
            } catch (e: any) {
              lastErr = e
              const status = e?.response?.status
              // only retry on 429 (too many requests); rethrow other errors immediately
              if (status !== 429) throw e
              if (i < attempts - 1) await sleep(baseDelay * Math.pow(2, i))
            }
          }
          throw lastErr
        }

        const res = await axiosRetry(() => axiosInstance.get(`/api/shops/${shopId}`), 3, 300)
        const data = res?.data
        const shop = data?.shop || data
        if (shop) {
          setValue('name', shop.name || '')
          setValue('bio', shop.bio || '')
          setAvatar(shop.image || null)
          setCover(shop.coverBanner || null)
          setImagesState([{ file_url: shop.image }, { file_url: shop.coverBanner }])
        }
      } catch (err: any) {
        // If the response was a plain text error (e.g. 429 rate limiter) axios will throw — log status/data if available
        console.error('Failed to load shop', err)
        try { if (err?.response?.status === 429) toast.error('Too many requests — try again in a moment') } catch(e){}
      }
    }
    load()
  }, [shopId, setValue])

  const watchedName = watch('name')
  const watchedBio = watch('bio')

  const convertFileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })

  const uploadImage = async (file: File | null) => {
    if (!file) return null
    const base64 = await convertFileToBase64(file)
    const res = await axiosInstance.post('/product/api/upload-product-image', { fileName: base64 })
    return res?.data?.file_url || null
  }

  const handleCoverChange = async (file: File | null) => {
    if (!file) return
    try {
      setLoading(true)
      setCoverUploading(true)
      const url = await uploadImage(file)
      if (url) setCover(url)
      setImagesState(prev => { const cp = [...prev]; cp[1] = { file_url: url }; return cp })
    } catch (e) { console.error(e); toast.error('Upload failed') } finally { setLoading(false) }
  }

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return
    try {
      setLoading(true)
      setAvatarUploading(true)
      const url = await uploadImage(file)
      if (url) setAvatar(url)
      setImagesState(prev => { const cp = [...prev]; cp[0] = { file_url: url }; return cp })
    } catch (e) { console.error(e); toast.error('Upload failed') } finally { setLoading(false) }
  }

  const onSubmit = async (values: any) => {
    if (!shopId) { toast.error('Shop not found'); return }
    // Short-circuit if browser is offline to avoid confusing "Network Error" messages
    if (typeof window !== 'undefined' && 'onLine' in window.navigator && !window.navigator.onLine) {
      toast.error('You appear to be offline — check your connection and try again')
      return
    }

    try {
      setLoading(true)
      const payload: any = { name: values.name, bio: values.bio }
      if (avatar) payload.image = avatar
      if (cover) payload.coverBanner = cover

      // Use axiosInstance.patch via gateway so cookies and interceptors are applied
      // If gateway returns 429 briefly (concurrency/backoff), perform a small retry
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

      // Robust retry helper: retry transient 429 and network errors (no response) with backoff.
      const axiosRetryWithNetworkHandling = async (fn: () => Promise<any>, attempts = 3, baseDelay = 300) => {
        let lastErr: any
        for (let i = 0; i < attempts; i++) {
          try {
            return await fn()
          } catch (e: any) {
            lastErr = e
            const status = e?.response?.status
            const isNetwork = !e?.response
            // Retry on 429 or network errors (connection refused, DNS, CORS network failures)
            if (status === 429 || isNetwork) {
              // helpful debug logging for network failures
              if (isNetwork) {
                try {
                  const cfg = e?.config || {}
                  // eslint-disable-next-line no-console
                  console.warn(`Network error (attempt ${i + 1}/${attempts})`, {
                    message: e?.message,
                    url: cfg?.url,
                    baseURL: cfg?.baseURL || axiosInstance.defaults.baseURL,
                    method: cfg?.method,
                  })
                } catch (logErr) { /* ignore logging errors */ }
              }
              // small exponential backoff
              if (i < attempts - 1) await sleep(baseDelay * Math.pow(2, i))
              continue
            }
            // non-retriable error, rethrow immediately
            throw e
          }
        }
        // Failed after retries — if this was a network error, wrap with a friendlier message
        if (lastErr && !lastErr?.response) {
          const cfg = lastErr?.config || {}
          const base = cfg?.baseURL || axiosInstance.defaults.baseURL
          throw new Error(`Network error: cannot reach API at ${base}${cfg?.url || ''} — ${lastErr?.message || 'no response'}`)
        }
        throw lastErr
      }

      const res = await axiosRetryWithNetworkHandling(() => axiosInstance.patch(`/api/shops/${shopId}`, payload), 3, 300)
      if (!res || (res.status && res.status >= 400)) {
        const message = res?.data?.message || 'Failed to update shop'
        throw new Error(message)
      }

      toast.success('Settings saved')
      try { queryClient.invalidateQueries({ queryKey: ['seller'] }) } catch (e) {}
      router.push('/dashboard')
    } catch (err: any) {
      // axios error handling: prefer server message, handle 429 and network errors specially
      const status = err?.response?.status
      const serverMessage = err?.response?.data?.message
      const isNetwork = !err?.response
      if (status === 429) {
        console.warn('Update blocked by 429 (Too Many Requests)', { shopId, message: serverMessage || err?.message })
        toast.error('Too many requests — please try again shortly')
      } else if (isNetwork) {
        // include baseURL/url hints when possible and attempt to serialize hidden properties
        const cfg = err?.config || {}
        const base = cfg?.baseURL || axiosInstance.defaults.baseURL
        // attempt to extract useful properties even when browser reports an empty object
        try {
          const info: any = {
            message: err?.message || String(err),
            name: err?.name,
            stack: err?.stack,
            url: cfg?.url || undefined,
            baseURL: base,
            method: cfg?.method,
            status: err?.response?.status,
            responseHeaders: err?.response?.headers,
          }
          // include non-enumerable props from error object if present
          try {
            const keys = Object.getOwnPropertyNames(err || {})
            for (const k of keys) {
              if (!(k in info)) info[k] = (err as any)[k]
            }
          } catch (e) {}
          console.error('Network error while updating shop', info)
        } catch (logErr) {
          console.error('Network error while updating shop (failed to serialize)', logErr, err)
        }
        toast.error(`Network error — cannot reach API at ${base}. Check the browser API URL and CORS origin.`)
      } else {
        console.error('Update failed', err)
        const message = serverMessage || err?.message || 'Save failed'
        toast.error(message)
      }
    } finally { setLoading(false) }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Store Settings</h1>
            <p className="text-sm text-slate-500">Manage your store profile, images and information.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Profile</h2>
              <div className="text-sm text-slate-400">Update store identity</div>
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Shop Name</label>
              <input {...register('name')} className="w-full border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Shop name" />

              <label className="text-sm font-medium">Short Bio</label>
              <textarea {...register('bio')} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="A short description shown to customers" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm font-medium block mb-2">Profile Image</label>
                  <div className="rounded-lg border border-dashed border-gray-200 p-3 bg-white">
                    <ImagePlaceHolder size="256 x 256" pictureUploadingLoader={avatarUploading || loading} onImageChange={async (f) => { await handleAvatarChange(f); setAvatarUploading(false) }} onRemove={() => setAvatar(null)} defaultImage={avatar} setSelectedImage={() => {}} index={0} images={imagesState} setOpenImageModal={() => {}} />
                    {avatarUploading && <div className="mt-2 text-xs text-slate-500 flex items-center gap-2"><svg className="w-4 h-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>Uploading...</div>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Cover Banner</label>
                  <div className="rounded-lg border border-dashed border-gray-200 p-3 bg-white">
                    <ImagePlaceHolder size="900 x 300" pictureUploadingLoader={coverUploading || loading} onImageChange={async (f) => { await handleCoverChange(f); setCoverUploading(false) }} onRemove={() => setCover(null)} defaultImage={cover} setSelectedImage={() => {}} index={1} images={imagesState} setOpenImageModal={() => {}} />
                    {coverUploading && <div className="mt-2 text-xs text-slate-500 flex items-center gap-2"><svg className="w-4 h-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>Uploading...</div>}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 mt-6">
                <button type="button" onClick={() => router.push('/dashboard')} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancel</button>
                <div className="flex items-center gap-3">
                  {loading && <div className="text-sm text-slate-500">Saving...</div>}
                  <button type="submit" className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">{loading ? 'Saving...' : 'Save settings'}</button>
                </div>
              </div>
            </div>
          </form>

          <aside className="hidden lg:block">
            <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl p-4 shadow sticky top-24">
              <div className="relative h-44 w-full rounded overflow-hidden shadow-inner mb-3 bg-gradient-to-r from-emerald-100 via-emerald-50 to-white">
                {cover || imagesState[1]?.file_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover || imagesState[1]?.file_url} alt="cover preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Cover preview</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-4 bottom-4 text-white">
                  <div className="text-lg font-semibold">{watchedName || (seller as any)?.shop?.name || 'Your shop'}</div>
                  <div className="text-xs opacity-80 max-w-xs">{watchedBio || (seller as any)?.shop?.bio || 'Short description will appear here.'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 shadow">
                  {avatar || imagesState[0]?.file_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar || imagesState[0]?.file_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">Avatar</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-lg font-semibold">{watchedName || (seller as any)?.shop?.name || 'Your shop'}</div>
                  <div className="text-sm text-slate-500 mt-1">{watchedBio || (seller as any)?.shop?.bio || 'Short description will appear here.'}</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400">Live preview updates as you edit. Images appear after upload completes.</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
