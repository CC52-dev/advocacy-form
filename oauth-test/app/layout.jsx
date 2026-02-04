import './globals.css'

export const metadata = {
  title: 'OAuth Test App',
  description: 'Test application for OAuth integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
