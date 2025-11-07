#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_maxIter;
uniform vec2 u_center;
uniform float u_scale; // pixels per unit
uniform vec2 u_juliaC;
uniform int u_mode; // 0=mandelbrot, 1=julia
uniform int u_interp; // 0=smooth, 1=escape, 2=orbit

// palette as up to 8 colors passed in uniforms
uniform int u_paletteSize;
uniform vec3 u_palette[8];

in vec2 v_uv;
out vec4 fragColor;

vec3 paletteColor(float t) {
  if (u_paletteSize <= 1) return u_palette[0];
  float x = clamp(t, 0.0, 1.0) * float(u_paletteSize - 1);
  int i = int(floor(x));
  int j = min(i + 1, u_paletteSize - 1);
  float f = fract(x);
  vec3 a = u_palette[i];
  vec3 b = u_palette[j];
  return mix(a, b, f);
}

vec2 screenToComplex(vec2 uv) {
  // uv [0..1] -> screen in pixels
  vec2 px = uv * u_resolution;
  // center in complex plane, scale is pixels per unit
  vec2 c = u_center + (px - u_resolution * 0.5) / u_scale;
  return c;
}

float mandelbrotEscape(vec2 c) {
  vec2 z = vec2(0.0);
  float n = 0.0;
  for (int i = 0; i < 10000; i++) {
    if (i >= u_maxIter) break;
    // z = z^2 + c
    float x = (z.x * z.x - z.y * z.y) + c.x;
    float y = (2.0 * z.x * z.y) + c.y;
    z = vec2(x, y);
    if (dot(z, z) > 4.0) { n = float(i); break; }
  }
  if (n == 0.0 && dot(z,z) <= 4.0) return -1.0; // didn't escape
  // smooth interpolation
  if (u_interp == 0) {
    float mag = dot(z,z);
    float nu = n + 1.0 - log(log(mag)) / log(2.0);
    return nu;
  }
  return n;
}

float juliaEscape(vec2 z0, vec2 c) {
  vec2 z = z0;
  float n = 0.0;
  for (int i = 0; i < 10000; i++) {
    if (i >= u_maxIter) break;
    float x = (z.x * z.x - z.y * z.y) + c.x;
    float y = (2.0 * z.x * z.y) + c.y;
    z = vec2(x, y);
    if (dot(z, z) > 4.0) { n = float(i); break; }
  }
  if (n == 0.0 && dot(z,z) <= 4.0) return -1.0;
  if (u_interp == 0) {
    float mag = dot(z,z);
    float nu = n + 1.0 - log(log(mag)) / log(2.0);
    return nu;
  }
  return n;
}

void main() {
  vec2 cplane = screenToComplex(v_uv);
  float esc;
  if (u_mode == 0) {
    esc = mandelbrotEscape(cplane);
  } else {
    esc = juliaEscape(cplane, u_juliaC);
  }

  if (esc < 0.0) {
    // inside set: orbit trap option (dark core or themed)
    if (u_interp == 2) {
      fragColor = vec4(0.05, 0.07, 0.10, 1.0);
    } else {
      fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    return;
  }

  float t = esc / float(u_maxIter);
  vec3 col;
  if (u_interp == 1) {
    // escape time: harsher bands
    col = paletteColor(pow(t, 0.8));
  } else {
    // smooth: continuous gradient
    col = paletteColor(t);
  }
  fragColor = vec4(col, 1.0);
}
