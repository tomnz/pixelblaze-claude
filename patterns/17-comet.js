// Comet — Pattern ID: W4KtSEgev2W4bYoA5
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// A bright comet corkscrews through the 8 layers, leaving a
// fading rainbow trail. The comet head sweeps along X via
// wave() with per-layer phase offsets for helical motion.
// -------------------------------------------------------
// Design: Spatial brightness (squared falloff from comet head)
// multiplied by temporal brightness (trail age decay). Per-layer
// delay creates the corkscrew path. Trail hue shifts with age
// for rainbow wake. Saturation increases with trail age (white
// head to saturated tail). Speed and trail length adjustable.
// -------------------------------------------------------

var speed = 0.03
var trailLen = 0.4
var cometWidth = 0.1
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
export function sliderTrail(v) { trailLen = mix(0.1, 0.8, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(speed)
  var cometX = wave(t + layerPhase * 0.5)
  var layerDelay = layerPhase * 0.15
  var age = mod(t - layerDelay, 1)
  var timeBright = 1
  if (age > trailLen) { timeBright = 0 }
  else { timeBright = 1 - age / trailLen }
  var dx = abs(x - cometX)
  var spaceBright = max(0, 1 - dx / cometWidth)
  spaceBright = spaceBright * spaceBright
  var bright = spaceBright * timeBright
  var hue = time(0.06) + age * 0.8 + layerPhase * 0.15
  var sat = 0.3 + age * 0.7
  hsv(hue, sat, bright)
}
