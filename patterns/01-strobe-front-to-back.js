// Strobe Front-to-Back — Pattern ID: bKWeMM74DarQrsNeR
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Layers light up sequentially front-to-back with a fading
// trail. Hue cycles over time and shifts per layer for a
// rainbow chase effect. Uses continuous position (not
// floor-snapped) for smooth fluid movement.
// -------------------------------------------------------
// Design: time(speed)*8 gives continuous position across
// 8 layers. Trail fades with squared falloff. Hue auto-
// cycles via time(0.05) with per-layer and per-x offsets.
// Bright pixels desaturate toward white for hot-head look.
// -------------------------------------------------------

var speed = 0.03
var trailLen = 2

export function sliderSpeed(v) { speed = mix(0.01, 0.06, v) }
export function sliderTrailLength(v) { trailLen = floor(mix(0, 6, v)) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var t = time(speed)
  var pos = t * 8
  var dist = mod(pos - layer + 8, 8)
  var bright = 0
  if (dist < 1) {
    bright = 1
  } else if (dist < 1 + trailLen) {
    bright = 1 - (dist - 1) / trailLen
    bright = bright * bright
  }
  // Hue shifts over time and per layer, with x shimmer
  var hue = time(0.05) + layer / 8 * 0.3 + x * 0.1
  var sat = 1 - bright * 0.3
  hsv(hue, sat, bright)
}
