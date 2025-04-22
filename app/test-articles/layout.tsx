export const metadata = {
  title: 'RESEARKA - Article Test',
  description: 'Test page for RESEARKA article loading functionality',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  )
}
