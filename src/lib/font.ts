import localFont from "next/font/local";

// Define Khmer Digital font with all weights at module level
export const fontKhmerDigital = localFont({
  src: [
    {
      path: "../../public/assets/fonts/KhmerDigital-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/KhmerDigital-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/KhmerDigital-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/KhmerDigital-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/KhmerDigital-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/KhmerDigital-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/KhmerDigital-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/KhmerDigital-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/KhmerDigital-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-khmer-digital",
  display: "swap",
});
