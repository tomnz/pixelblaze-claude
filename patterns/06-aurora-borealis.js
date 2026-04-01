// Aurora Borealis — Pattern ID: hWrLhGfHrpw9xSjy6
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Slow sinuous bands of cool color drift along each layer.
// Wide hue spread (60% of color wheel) ensures strong
// per-layer contrast with organic aurora motion.
// -------------------------------------------------------
// Design: Three wave layers with per-layer frequency scaling
// create complex interference. Separate time() calls at
// irrational ratios (0.71, 1.3) avoid sawtooth wrap glitches.
// Minimum brightness floor of 0.04 keeps display active.
// -------------------------------------------------------

var driftSpeed = 0.05
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderDriftSpeed(v) { driftSpeed = mix(0.02, 0.12, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t1 = time(driftSpeed)
  var t2 = time(driftSpeed * 0.71)
  var t3 = time(driftSpeed * 1.3)
  var tHue = time(0.09)
  var tHue2 = time(0.07)
  var freq1 = 2 + layer * 0.4
  var freq2 = 1.5 + layer * 0.3
  var phase1 = layerPhase * 2.5
  var phase2 = layerPhase * 1.7
  var b1 = wave(x * freq1 - t1 + phase1)
  var b2 = wave(x * freq2 + t2 + phase2)
  var b3 = wave(x * (3 + layer * 0.2) - t3 + layerPhase * 3)
  var bright = b1 * b2
  bright = max(bright, b3 * 0.45)
  bright = max(bright, 0.04)
  var hue = tHue + layerPhase * 0.6 + wave(x * 1.5 + tHue2 + layerPhase * 2) * 0.06
  var sat = 0.6 + bright * 0.3
  hsv(hue, clamp(sat, 0, 1), bright)
}
