import './global.css';
import {Oswald, Poppins, Roboto} from "next/font/google"
import Providers from '../providers';




export const metadata = {
  title: 'Oherbuy',
  description: 'We deals with medicinal',
};

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100','300','400','500','700','900'],
  variable: '--font-roboto'
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100','200','300','500','500','600','700','800','900'],
  variable: '--font-poppins',
  
})

const oswald = Oswald({
    subsets: ['latin'],
     weight: ['200','300','500','500','600','700'],
     variable: "--font-oswald"
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen ${roboto.variable} ${oswald.variable} ${poppins.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
        </body>
    </html>
  );
}
