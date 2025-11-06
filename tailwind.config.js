/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// Design System Colors
				text: {
					primary: '#2A2A2A',
					secondary: '#5A5A5A',
					tertiary: '#8A8A8A',
				},
				background: {
					page: '#FEFDFB',
					surface: '#F9F7F3',
					elevated: '#FFFFFF',
				},
				accent: {
					primary: '#C8A882',
					secondary: '#B8A1C8',
					hover: '#A88F6E',
				},
				semantic: {
					link: '#9B88AA',
					'link-hover': '#7D6A8E',
					divider: '#E8E4DD',
					border: '#D8D3CA',
				},
				// Legacy shadcn colors
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#C8A882',
					foreground: '#FFFFFF',
				},
				secondary: {
					DEFAULT: '#B8A1C8',
					foreground: '#FFFFFF',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			fontFamily: {
				serif: ['Noto Serif SC', 'Source Han Serif SC', 'STSong', 'Georgia', 'serif'],
				sans: ['PingFang SC', '-apple-system', 'Microsoft YaHei', 'sans-serif'],
			},
			fontSize: {
				display: ['64px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
				h1: ['48px', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
				h2: ['32px', { lineHeight: '1.3' }],
				h3: ['24px', { lineHeight: '1.4' }],
				'body-large': ['22px', { lineHeight: '1.8' }],
				body: ['18px', { lineHeight: '1.7' }],
				'body-small': ['16px', { lineHeight: '1.6' }],
				metadata: ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
			},
			spacing: {
				xs: '8px',
				sm: '16px',
				md: '24px',
				lg: '32px',
				xl: '48px',
				'2xl': '64px',
				'3xl': '96px',
				'4xl': '128px',
			},
			borderRadius: {
				none: '0px',
				xs: '4px',
				sm: '8px',
				md: '12px',
				full: '9999px',
			},
			boxShadow: {
				card: '0 2px 8px rgba(200, 168, 130, 0.08)',
				'card-hover': '0 4px 16px rgba(200, 168, 130, 0.12)',
				modal: '0 8px 32px rgba(0, 0, 0, 0.12)',
			},
			maxWidth: {
				container: '1280px',
				content: '700px',
			},
			transitionDuration: {
				fast: '200ms',
				standard: '300ms',
				slow: '400ms',
			},
			transitionTimingFunction: {
				default: 'ease-out',
				refined: 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}