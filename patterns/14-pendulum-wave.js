// Pendulum Wave — Pattern ID: Yh8oLYiAS89CwgEXP
//
// Each layer has a bright point swinging at a slightly different
// frequency, creating classic pendulum wave phase patterns
// that sync and desync over time.
//
// Design: Per-layer frequency = 1 + layer * freqSpread, using
// triangle() for smooth pendulum motion. Bright core (8x falloff)
// with wider dim trail (3x falloff, 0.15 brightness). Hue
// drifts with time, layer offset, and pendulum position.

var baseSpeed = 0.03
var freqSpread = 0.4
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
// Auto-detect layer count and y range from pixel map
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

// How fast the pendulums swing back and forth
export function sliderSpeed(v) { baseSpeed = mix(0.01, 0.06, v) }
// How quickly the layers drift out of sync with each other
export function sliderFreqSpread(v) { freqSpread = mix(0.1, 0.8, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var freq = 1 + layer * freqSpread // each layer swings at a slightly different frequency
  var t = time(baseSpeed * freq) // separate time() per frequency avoids sawtooth wrap glitches
  var pendPos = triangle(t) // triangle wave gives smooth back-and-forth pendulum motion
  var dx = abs(x - pendPos)
  var bright = max(0, 1 - dx * 8) // tight bright core: ~0.125 radius
  bright = bright * bright // squared for sharp peak
  var trail = max(0, 1 - dx * 3) * 0.15 // wider dim trail: ~0.33 radius, 15% max brightness
  bright = max(bright, trail)
  var hue = time(0.08) + layerPhase * 0.4 + pendPos * 0.15
  var sat = 0.6 + bright * 0.4
  hsv(hue, sat, bright)
}
