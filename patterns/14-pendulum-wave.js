// Pendulum Wave — Pattern ID: Yh8oLYiAS89CwgEXP
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Each layer has a bright point swinging at a slightly different
// frequency, creating classic pendulum wave phase patterns
// that sync and desync over time.
// -------------------------------------------------------
// Design: Per-layer frequency = 1 + layer * freqSpread, using
// triangle() for smooth pendulum motion. Bright core (8x falloff)
// with wider dim trail (3x falloff, 0.15 brightness). Hue
// drifts with time, layer offset, and pendulum position.
// -------------------------------------------------------

var baseSpeed = 0.03
var freqSpread = 0.4
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderSpeed(v) { baseSpeed = mix(0.01, 0.06, v) }
export function sliderFreqSpread(v) { freqSpread = mix(0.1, 0.8, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var freq = 1 + layer * freqSpread
  var t = time(baseSpeed * freq)
  var pendPos = triangle(t)
  var dx = abs(x - pendPos)
  var bright = max(0, 1 - dx * 8)
  bright = bright * bright
  var trail = max(0, 1 - dx * 3) * 0.15
  bright = max(bright, trail)
  var hue = time(0.08) + layerPhase * 0.4 + pendPos * 0.15
  var sat = 0.6 + bright * 0.4
  hsv(hue, sat, bright)
}
