/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          bg: '#EFEAE2',
          header: '#F6F6F6',
          border: '#E2E2E8',
          outgoing: '#D9FDD3',
          outgoingDark: '#C7EDBF',
          incoming: '#FFFFFF',
          incomingQuote: '#F5F5F7',
          outgoingQuote: '#C8ECC0',
          green: '#25D366',
          send: '#00A884',
          blue: '#007AFF',
          ticks: '#53BDEB',
          doc: '#D9366E',
          marty: '#0E8040',
          you: '#007AFF',
          subtext: '#667781',
          time: '#8696A0'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        'wa-bubble': '0 1px 0.5px rgba(11,20,26,0.13)',
        'wa-dock': '0 -2px 10px rgba(0,0,0,0.06)'
      }
    },
  },
  plugins: [],
}
