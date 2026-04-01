// Color Strobe — Pattern ID: qSQsBYADnoHFceARu
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Maximum framerate chaos. Rapid color cycling with hard
// on/off strobing. Each layer gets a different rainbow slice
// for a frenetic light show effect.
// -------------------------------------------------------
// Design: Three time() calls at different speeds (fast, medium,
// base) for layered strobe beats. Chaos slider controls hard
// threshold cutoff and random blackout probability. Per-layer
// hue offset (0.5 spread) plus x gradient for rainbow variety.
// -------------------------------------------------------

var speed = 0.008
var chaos = 0.7
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderSpeed(v) { speed = mix(0.003, 0.02, v) }
export function sliderChaos(v) { chaos = v }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var t = time(speed)
  var tFast = time(0.002)
  var tMed = time(0.005)
  var hue = tFast + layer / numLayers * 0.5
  hue = hue + x * 0.3
  var b1 = wave(t + layer / numLayers * 0.7)
  var b2 = wave(tMed + x * 2 + layer * 0.4)
  var bright = b1 * b2
  if (chaos > 0.5) {
    var thresh = (1 - chaos) * 2
    bright = bright > thresh ? 1 : 0
  }
  var blackout = wave(tFast * 3 + layer * 0.37)
  if (blackout < chaos * 0.3) bright = 0
  hsv(hue, 0.7 + bright * 0.3, bright)
}
