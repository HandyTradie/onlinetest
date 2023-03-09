/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      cursor: {
        grab: 'grabbing'
      },
      colors: {
        'slate-light': '#F9F9F9', // theme: slate, background color
        'slate-orange': '#FF5930', // theme: slate, primary orange
        'slate-headline': '#1C202B', // theme: slate, headline color
        'slate-body': '#2C3242', // theme: slate, body text color
        'slate-blue': 'rgba(67, 83, 255, 1)', // theme: slate, primary blue
        'feeling-moody-start': '#E1ECF6', // theme: slate, start of gradient
        'feeling-moody-end': '#F0E3E3', // theme: slate, end of gradient
        'slate-border': 'rgba(25, 49, 60, 0.1)', // theme: slate, end of the border
        primary: {
          blue: '#4353ff'
        }
      },
      boxShadow: {
        slight: '0px 13px 19px 8px #C8DDE53B'
      },
      fontSize: {
        'desktop-h1': '48px;',
        'desktop-h2': '42px',
        'desktop-subheading': '21px',
        'desktop-h4': '20px',
        'desktop-paragraph': '18px',
        'mobile-h2': '32px',
        'mobile-h1': '38px',
        'mobile-h3': '26px'
      },
      maxWidth: {
        default: '1146px'
      },
      padding: {
        mob: '24px'
      },
      screens: {
        '3xs': '240px',
        '2xs': '320px',
        xs: { min: '425px', max: '640px' },
        ...defaultTheme.screens
      },
      gridTemplateColumns: {
        'fill-40': 'repeat(auto-fill, 10rem)'
      }
    }
  },
  // eslint-disable-next-line no-undef
  plugins: [require('@tailwindcss/line-clamp')]
};
