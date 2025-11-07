module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aurora: '#7bd389',
        neon: '#00ffd1',
        retro: '#ffaf00',
        solar: '#ff5e5b',
        grayglass: 'rgba(255,255,255,0.08)'
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glow: '0 0 20px rgba(0,255,209,0.4)'
      }
    }
  },
  plugins: []
};
