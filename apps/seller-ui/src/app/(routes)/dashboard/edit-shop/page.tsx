"use client"
import React, { useEffect, useState } from 'react'
import useSeller from 'apps/seller-ui/src/hooks/useSeller'
import ImagePlaceHolder from 'apps/seller-ui/src/share/components/image-placeholder'
import axiosInstance from 'apps/seller-ui/src/utils/axiosinstance'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'

const USER_UI_URL = process.env.NEXT_PUBLIC_USER_UI_URL || 'http://localhost:3000'

export default function EditShopPage() {
  const { seller, isLoading } = useSeller()
  const shopId = (seller as any)?.shop?.id || (seller as any)?.shopId || null
  const { register, handleSubmit, setValue } = useForm()
  const [loading, setLoading] = useState(false)
  const [cover, setCover] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [imagesState, setImagesState] = useState<any[]>([null])

  useEffect(() => {
    const load = async () => {
      if (!shopId) return
      try {
        const res = await fetch(`${USER_UI_URL}/api/shops/${shopId}`, { credentials: 'include' })
        const data = await res.json()
        const shop = data?.shop || data
        if (shop) {
          setValue('name', shop.name || '')
          setValue('bio', shop.bio || '')
          setAvatar(shop.image || null)
          setCover(shop.coverBanner || null)
          setImagesState([{ file_url: shop.image }, { file_url: shop.coverBanner }])
        }
      } catch (err) {
        console.error('Failed to load shop', err)
      }
    }
    load()
  }, [shopId, setValue])

  const convertFileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }

  const uploadImage = async (file: File | null) => {
    if (!file) return null
    const base64 = await convertFileToBase64(file)
    const res = await axiosInstance.post('/product/api/upload-product-image', { fileName: base64 })
    return res?.data?.file_url || res?.data?.file_url || null
  }

  const handleCoverChange = async (file: File | null) => {
    if (!file) return
    try {
      setLoading(true)
      const url = await uploadImage(file)
      if (url) setCover(url)
      setImagesState((prev) => { const cp = [...prev]; cp[1] = { file_url: url }; return cp })
    } catch (e) { console.error(e); toast.error('Upload failed') } finally { setLoading(false) }
  }

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return
    try {
      setLoading(true)
      const url = await uploadImage(file)
      if (url) setAvatar(url)
      setImagesState((prev) => { const cp = [...prev]; cp[0] = { file_url: url }; return cp })
    } catch (e) { console.error(e); toast.error('Upload failed') } finally { setLoading(false) }
  }

  const onSubmit = async (values: any) => {
    if (!shopId) { toast.error('Shop not found'); return }
    try {
      setLoading(true)
      const payload: any = {
        name: values.name,
        bio: values.bio,
      }
      if (avatar) payload.image = avatar
      if (cover) payload.coverBanner = cover

      // send PATCH to user-ui API route which handles auth and owner checks
      const res = await fetch(`${USER_UI_URL}/api/shops/${shopId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to update shop')
      }

      toast.success('Shop updated')
      // optional: refresh page
      setTimeout(() => window.location.href = '/dashboard', 800)
    } catch (err: any) {
      console.error('Update shop failed', err)
      toast.error(err?.message || 'Failed to update shop')
    } finally { setLoading(false) }
  }

  if (isLoading) return <div className="p-6">Loading seller...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm text-emerald-600">Dashboard</Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Edit Shop Profile</h2>

        <div className="grid grid-cols-1 gap-4">
          <label className="text-sm font-medium">Shop Name</label>
          <input {...register('name')} className="w-full border rounded px-3 py-2" />

          <label className="text-sm font-medium">Bio</label>
          <textarea {...register('bio')} rows={4} className="w-full border rounded px-3 py-2" />

          <div>
            <label className="block text-sm font-medium mb-2">Cover Banner</label>
            <ImagePlaceHolder
              size="900 x 300"
              pictureUploadingLoader={loading}
              onImageChange={handleCoverChange}
              onRemove={() => setCover(null)}
              defaultImage={cover}
              setSelectedImage={() => {}}
              index={1}
              images={imagesState}
              setOpenImageModal={() => {}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Profile Image</label>
            <ImagePlaceHolder
              size="256 x 256"
              pictureUploadingLoader={loading}
              onImageChange={handleAvatarChange}
              onRemove={() => setAvatar(null)}
              defaultImage={avatar}
              setSelectedImage={() => {}}
              index={0}
              images={imagesState}
              setOpenImageModal={() => {}}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => window.location.href = '/dashboard'} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Saving...' : 'Save changes'}</button>
          </div>
        </div>
      </form>
    </div>
  )
}
