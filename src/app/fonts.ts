import {
  Arimo,
  DM_Mono,
  DM_Sans,
  Fragment_Mono,
  Roboto_Mono,
  Sorts_Mill_Goudy,
} from "next/font/google";
import localFont from "next/font/local";

/** Helvetica/Arial metrics; includes real 600 weight (system Helvetica often does not). */
export const navFont = Arimo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const sortsMillGoudy = Sorts_Mill_Goudy({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  style: ["normal", "italic"],
});

/** Saga wordmark — always regular weight, never bold */
export const sagaLogoClass = `${sortsMillGoudy.className} font-normal`;

export const jannonText = localFont({
  src: "./fonts/Jannon Text Regular.otf",
  variable: "--font-jannon-text",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
});
