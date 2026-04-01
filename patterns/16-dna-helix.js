// DNA Helix — Pattern ID: FS2Mz2ixvCfsHF4QT
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Two strands weave back and forth across each layer, with
// phase offsets through depth creating a rotating double helix.
// Connecting rungs appear between the strands.
// -------------------------------------------------------
// Design: Two wave() strands offset by 0.5 (180 degrees) with
// per-layer phase shift (0.8) for helical rotation through depth.
// Rungs rendered between strands when separation > 0.05, using
// high-frequency wave pattern for discrete rung segments.
// Complementary hues (0.45 apart) for the two strands.
// -------------------------------------------------------

var speed = 0.04
var helixWidth = 0.08
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderSpeed(v) { speed = mix(0.015, 0.08, v) }
export function sliderWidth(v) { helixWidth = mix(0.03, 0.15, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(speed)
  var strand1 = wave(t + layerPhase * 0.8)
  var strand2 = wave(t + layerPhase * 0.8 + 0.5)
  var d1 = abs(x - strand1)
  var d2 = abs(x - strand2)
  var b1 = max(0, 1 - d1 / helixWidth)
  var b2 = max(0, 1 - d2 / helixWidth)
  b1 = b1 * b1
  b2 = b2 * b2
  var hue1 = time(0.07) + layerPhase * 0.1
  var hue2 = hue1 + 0.45
  var strandDist = abs(strand1 - strand2)
  var rung = 0
  if (strandDist > 0.05) {
    var mid = (strand1 + strand2) / 2
    var span = strandDist / 2
    var xFromMid = abs(x - mid)
    if (xFromMid < span) {
      var rungPattern = wave(x * 12 + t * 2)
      rung = (rungPattern > 0.85) ? (1 - xFromMid / span) * 0.4 : 0
    }
  }
  if (b1 > b2) {
    hsv(hue1, 0.7 + b1 * 0.3, max(b1, rung))
  } else {
    hsv(hue2, 0.7 + b2 * 0.3, max(b2, rung))
  }
}
