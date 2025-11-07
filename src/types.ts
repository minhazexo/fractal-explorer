export type Mode = 'mandelbrot' | 'julia';

export interface ViewState {
  mode: Mode;
  centerX: number; // complex plane
  centerY: number;
  scale: number;   // pixels per unit (or inverse zoom)
  maxIter: number;
  juliaCx: number;
  juliaCy: number;
  palette: string;
  theme: 'dark' | 'amoled' | 'light' | 'gradient';
  interpolation: 'smooth' | 'escape' | 'orbit';
}
