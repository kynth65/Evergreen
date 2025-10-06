/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '"Host Grotesk"',
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                ],
                grotesk: [
                    '"Host Grotesk"',
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                ],
                playfair: [
                    '"Playfair Display"',
                    "serif",
                ],
            },
            keyframes: {
                shine: {
                    "0%": { "background-position": "100%" },
                    "100%": { "background-position": "-100%" },
                },
            },
            animation: {
                shine: "shine 5s linear infinite",
            },
        },
    },
    plugins: [],
};
