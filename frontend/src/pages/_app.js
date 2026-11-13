import "../styles/_global.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Be_Vietnam_Pro, Big_Shoulders_Display } from "next/font/google";
import { RouteProgress } from "@/components/ui";

// Font giao diện mới, cấp qua biến CSS --font-display / --font-body
const displayFont = Big_Shoulders_Display({
    subsets: ["latin", "vietnamese"],
    weight: ["800", "900"],
    variable: "--font-display",
});
const bodyFont = Be_Vietnam_Pro({
    subsets: ["latin", "vietnamese"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-body",
});

export default function MyApp({ Component, pageProps }) {
    const getLayout = Component.getLayout || ((page) => page);

    return (
        <>
            <RouteProgress />
            <div className={`${displayFont.variable} ${bodyFont.variable}`}>
                {getLayout(<Component {...pageProps} />)}
            </div>
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </>
    );
}
