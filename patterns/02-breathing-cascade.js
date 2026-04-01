// Breathing Cascade — Pattern ID: Yg8Gg5n55jth3FcDN
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// All layers pulse brightness like breathing, with a rolling
// time delay front-to-back. Shimmer along X adds texture
// within each layer.
// -------------------------------------------------------
// Design: Squared wave() for sharper pulse shape. Separate
// shimmer time() call at 5x speed avoids sawtooth glitch.
// Spread slider controls phase offset between layers.
// Hue drifts over time with per-layer and per-x offsets.
// -------------------------------------------------------

var speed = 0.06
var spread = 0.5
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderSpeed(v) { speed = mix(0.02, 0.15, v) }
export function sliderSpread(v) { spread = mix(0.1, 1, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(speed)
  var tShimmer = time(speed * 5)
  var bright = wave(t + layerPhase * spread)
  bright = bright * bright
  var shimmer = wave(x * 3 + tShimmer + layerPhase * 2) * 0.3
  bright = clamp(bright + shimmer * bright, 0, 1)
  var hue = time(0.07) + layerPhase * 0.15 + x * 0.08 + bright * 0.05
  hsv(hue, 0.8 - bright * 0.2, bright)
}
