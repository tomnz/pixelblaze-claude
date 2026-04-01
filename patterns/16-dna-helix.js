// DNA Helix — Pattern ID: FS2Mz2ixvCfsHF4QT
//
// Two strands weave back and forth across each layer, with
// phase offsets through depth creating a rotating double helix.
// Connecting rungs appear between the strands.
//
// Design: Two wave() strands offset by 0.5 (180 degrees) with
// per-layer phase shift (0.8) for helical rotation through depth.
// Rungs rendered between strands when separation > 0.05, using
// high-frequency wave pattern for discrete rung segments.
// Complementary hues (0.45 apart) for the two strands.

var speed = 0.04
var helixWidth = 0.08 // half-width of each strand's glow
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

// How fast the helix rotates through the layers
export function sliderSpeed(v) { speed = mix(0.015, 0.08, v) }
// How thick each glowing strand appears
export function sliderWidth(v) { helixWidth = mix(0.03, 0.15, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(speed)
  // Two strands 180° apart; layerPhase * 0.8 rotates the helix through depth
  var strand1 = wave(t + layerPhase * 0.8)
  var strand2 = wave(t + layerPhase * 0.8 + 0.5) // +0.5 = 180° offset
  var d1 = abs(x - strand1)
  var d2 = abs(x - strand2)
  var b1 = max(0, 1 - d1 / helixWidth)
  var b2 = max(0, 1 - d2 / helixWidth)
  b1 = b1 * b1 // squared falloff for sharp strand glow
  b2 = b2 * b2
  var hue1 = time(0.07) + layerPhase * 0.1
  var hue2 = hue1 + 0.45 // complementary hue offset for second strand
  var strandDist = abs(strand1 - strand2)
  var rung = 0
  // Draw connecting rungs between strands when they're far enough apart
  if (strandDist > 0.05) {
    var mid = (strand1 + strand2) / 2
    var span = strandDist / 2
    var xFromMid = abs(x - mid)
    if (xFromMid < span) {
      var rungPattern = wave(x * 12 + t * 2) // high-frequency wave creates discrete rung segments
      rung = (rungPattern > 0.85) ? (1 - xFromMid / span) * 0.4 : 0 // 0.85 threshold = ~15% of space is lit
    }
  }
  if (b1 > b2) {
    hsv(hue1, 0.7 + b1 * 0.3, max(b1, rung))
  } else {
    hsv(hue2, 0.7 + b2 * 0.3, max(b2, rung))
  }
}
