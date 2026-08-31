import colors from "./styles/colors";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            fontFamily: {
                inter: ['InterVariable', 'sans-serif'],
            },
            opacity: {
                '33': '0.33',
                '66': '0.66',
            },
            colors: {
                ...colors,
                dynamic: ({ opacityValue }) => {
                    if (opacityValue !== undefined) {
                        return `hsl(var(--h) var(--s) var(--l) / ${opacityValue})`;
                    }
                    return `hsl(var(--h) var(--s) var(--l))`;
                }
            },
        }
    },
    plugins: [],
}

