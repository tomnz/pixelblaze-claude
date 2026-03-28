// Pendulum Wave — Pattern ID: Yh8oLYiAS89CwgEXP
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Each layer has a bright point swinging back and forth.
// Layers have slightly different frequencies, creating the
// classic pendulum wave effect — mesmerizing patterns emerge
// and dissolve as they drift in and out of sync.
// -------------------------------------------------------
// Design: Triangle wave gives smooth back-and-forth motion.
// Per-layer frequency (1 + layer * freqSpread) creates the
// characteristic pendulum wave phase drift. Soft glow trail
// (0.15 brightness at dx*3) keeps some visibility beyond
// the bright head. Hue follows pendulum position.
// -------------------------------------------------------

var baseSpeed = 0.03
var freqSpread = 0.4

export function sliderSpeed(v) { baseSpeed = mix(0.01, 0.06, v) }
export function sliderFreqSpread(v) { freqSpread = mix(0.1, 0.8, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  // Each layer swings at a slightly different frequency
  var freq = 1 + layer * freqSpread
  var t = time(baseSpeed * freq)

  // Pendulum position: triangle wave gives smooth back-and-forth
  var pendPos = triangle(t)

  // Distance from pendulum head
  var dx = abs(x - pendPos)

  // Bright head with soft glow trail
  var bright = max(0, 1 - dx * 8)
  bright = bright * bright

  // Subtle motion trail
  var trail = max(0, 1 - dx * 3) * 0.15
  bright = max(bright, trail)

  // Hue follows the pendulum position and shifts per layer
  var hue = time(0.08) + layerPhase * 0.4 + pendPos * 0.15
  var sat = 0.6 + bright * 0.4

  hsv(hue, sat, bright)
}
