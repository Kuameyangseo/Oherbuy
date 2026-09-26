import './globals.css'

export const metadata = {
  title: 'Oherbuy Admin',
  description: 'Oherbuy operations dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
