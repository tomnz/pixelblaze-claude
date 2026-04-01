// Strobe Front-to-Back — Pattern ID: bKWeMM74DarQrsNeR
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Layers light up sequentially front-to-back with a fading
// trail. Hue cycles over time and shifts per layer for a
// rainbow chase effect with smooth fluid movement.
// -------------------------------------------------------
// Design: Continuous position (not floor-snapped) for smooth
// motion. Trail length and speed are slider-controllable.
// Per-layer hue offset (0.3 spread) plus x modulation for
// color variation across all dimensions.
// -------------------------------------------------------

var speed = 0.03
var trailLen = 2
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderSpeed(v) { speed = mix(0.01, 0.06, v) }
export function sliderTrailLength(v) { trailLen = floor(mix(0, 6, v)) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var t = time(speed)
  var pos = t * numLayers
  var dist = mod(pos - layer + numLayers, numLayers)
  var bright = 0
  if (dist < 1) {
    bright = 1
  } else if (dist < 1 + trailLen) {
    bright = 1 - (dist - 1) / trailLen
    bright = bright * bright
  }
  var hue = time(0.05) + layer / numLayers * 0.3 + x * 0.1
  var sat = 1 - bright * 0.3
  hsv(hue, sat, bright)
}
