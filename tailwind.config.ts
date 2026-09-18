import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: [
		"./src/components/**/*.{vue,js,ts}",
		"./src/layouts/**/*.vue",
		"./src/pages/**/*.vue",
		"./src/plugins/**/*.{js,ts}",
		"./src/app.vue",
		"./src/error.vue",
	],
	theme: {
		extend: {
			colors: {
				bch: {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
					800: "#166534",
					900: "#14532d",
					950: "#052e16",
					green: "#0d8514",
					accent: "#0ac18e",
				},
			},
			fontFamily: {
				sans: [
					"Inter",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					"Oxygen",
					"Ubuntu",
					"Cantarell",
					'"Fira Sans"',
					'"Droid Sans"',
					'"Helvetica Neue"',
					"sans-serif",
				],
				mono: [
					"ui-monospace",
					"SFMono-Regular",
					"Menlo",
					"Monaco",
					"Consolas",
					'"Liberation Mono"',
					'"Courier New"',
					"monospace",
				],
			},
			boxShadow: {
				card: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
				"card-hover":
					"0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
				glow: "0 0 25px -5px rgba(16, 185, 129, 0.25)",
			},
		},
	},
	plugins: [],
} satisfies Config;
