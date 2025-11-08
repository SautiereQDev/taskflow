import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
  content: ['./views/**/*.ejs', './src/presentation/**/*.{ts,js}', './public/js/**/*.js'],

  theme: {
    extend: {},
  },

  plugins: [daisyui],

  daisyui: {
    themes: ['light', 'dark'],
    darkTheme: 'dark',
  },
};

export default config;
