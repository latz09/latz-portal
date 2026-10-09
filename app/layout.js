import { DM_Sans, DM_Mono, Fraunces } from 'next/font/google'
import './globals.css'
import { auth } from '@/auth'
import GlobalSearch from './components/utils/GlobalSearch'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
})

export const metadata = {
  title: 'Latz Portal',
  description: 'Latz Web Design internal portal',
  manifest: '/manifest.json',
  robots: 'noindex, nofollow',
}

export default async function RootLayout({ children }) {
  const session = await auth()
  const isInternal = session?.user?.role === 'internal'

  return (
    <html
      lang='en'
      className={`${dmSans.variable} ${dmMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col bg-dark'>
        {children}
        {/* {isInternal && <GlobalSearch />} */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`,
          }}
        />
      </body>
    </html>
  )
}