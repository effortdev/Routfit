/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101314',
        panel: '#171b1c',
        panelSoft: '#1f2426',
        line: '#2a3032',
        moss: '#8fae76',
        mossDeep: '#5f7a4a',
        ember: '#e0a458',
        paper: '#eee9df'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        card: '20px'
      }
    }
  },
  plugins: []
}
