import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Fractal Explorer', () => {
  test('renders the main application component', () => {
    render(<App />);
    const linkElement = screen.getByText(/Fractal Explorer/i);
    expect(linkElement).toBeInTheDocument();
  });

  // Additional tests for fractal rendering can be added here
});