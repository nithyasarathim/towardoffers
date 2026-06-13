import { Nunito_Sans, Poppins } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
});

export const metadata = {
  title: "TowardsOffer - DSA Practice Sheet",
  description: "Minimal DSA practice sheet with progress tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunitoSans.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
