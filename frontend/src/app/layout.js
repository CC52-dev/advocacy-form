import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Satsankalpa Advocacy",
  description:
    "Satsankalpa Foundation Inc is a 501(C)(3) non-profit organization in USA and Sri Sivananda Satsankalpa Foundation is a 80G non-profit organization in Bharat, focused on reviving ancient Sanathana culture and Thapo Kshetras. Join our global advocacy membership network.",
  openGraph: {
    title: "Satsankalpa Advocacy Membership",
    description:
      "Join Satsankalpa Foundation's global advocacy network. We are based in USA and Bharat, dedicated to peace and progress through Sanathana culture.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Satsankalpa Advocacy Membership",
    description:
      "Join Satsankalpa Foundation's global advocacy network. We are based in USA and Bharat, dedicated to peace and progress through Sanathana culture.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <form action="/api/clear" className="absolute top-5 right-5 m-4 z-50 bg-blue-600 text-white p-2 rounded-md">
                <button type="submit">Clear</button>
              
              </form>           */}
        {/* <ThemeProvider attribute="class" defaultTheme="light"> */}
        <ReactQueryProvider>
            {" "}
            <ViewTransitions>{children}</ViewTransitions>
          </ReactQueryProvider>

          <Toaster />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
