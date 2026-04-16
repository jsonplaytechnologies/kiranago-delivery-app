/**
 * Tailwind CSS configuration for KiranaGo Delivery (NativeWind v4)
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',
        'primary-dark': '#1B5E20',
        'primary-light': '#E8F5E9',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        'surface-dark': '#EEEEEE',
        text: '#1C1C1E',
        'text-secondary': '#6B7280',
        error: '#D32F2F',
        border: '#E5E5E5',
        warning: '#F57C00',
        success: '#2E7D32',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
