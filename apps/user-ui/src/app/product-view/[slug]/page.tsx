import { redirect } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dest = `/productoverview/${encodeURIComponent(slug)}`
  redirect(dest)
}
