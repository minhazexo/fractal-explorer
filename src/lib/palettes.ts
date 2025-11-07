export const PALETTES = {
  Aurora: ['#0b132b', '#1c2541', '#3a506b', '#5bc0be', '#6fffe9'],
  Solar: ['#0a0f1f', '#f94144', '#f3722c', '#f9c74f', '#90be6d', '#43aa8b', '#577590'],
  Neon: ['#030304', '#00ffd1', '#0ef', '#9f68ff', '#f441a5', '#fffb96'],
  Retro: ['#1a1423', '#3d314a', '#684756', '#9b7e6f', '#c2b19f'],
  Grayscale: ['#000000', '#2c2c2c', '#5a5a5a', '#8c8c8c', '#bdbdbd', '#e6e6e6', '#ffffff']
} as const;

export type PaletteName = keyof typeof PALETTES;
