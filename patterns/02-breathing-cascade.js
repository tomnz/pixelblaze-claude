// Breathing Cascade — Pattern ID: Yg8Gg5n55jth3FcDN
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// All layers pulse brightness like a heartbeat, with a
// rolling time delay front-to-back — a wave of light
// moving through the depth. Shimmer along X adds texture.
// -------------------------------------------------------
// Design: Uses separate time() calls for shimmer to avoid
// sawtooth wrap glitch (time(speed*5) not time(speed)*5).
// Brightness is squared (not cubed) to keep average ~20%.
// Hue drifts over time with per-layer and per-x variation.
// -------------------------------------------------------

var speed = 0.06
var spread = 0.5

export function sliderSpeed(v) { speed = mix(0.02, 0.15, v) }
export function sliderSpread(v) { spread = mix(0.1, 1, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8
  var t = time(speed)
  var tShimmer = time(speed * 5)
  var bright = wave(t + layerPhase * spread)
  bright = bright * bright
  // Shimmer along x within each layer
  var shimmer = wave(x * 3 + tShimmer + layerPhase * 2) * 0.3
  bright = clamp(bright + shimmer * bright, 0, 1)
  // Hue slowly cycles and shifts per layer and along x
  var hue = time(0.07) + layerPhase * 0.15 + x * 0.08 + bright * 0.05
  hsv(hue, 0.8 - bright * 0.2, bright)
}
