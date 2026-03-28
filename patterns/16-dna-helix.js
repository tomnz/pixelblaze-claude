// DNA Helix — Pattern ID: FS2Mz2ixvCfsHF4QT
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Two bright strands weave back and forth along each layer,
// phase-offset through depth so the crossing points spiral
// through the display like a rotating double helix.
// -------------------------------------------------------
// Design: Two wave() strands with 0.5 phase offset create
// opposite-phase sinusoids. Layer offset (layerPhase * 0.8)
// creates the helix twist through depth. Thin rungs appear
// between strands when they're far apart (strandDist > 0.05).
// Each strand has a distinct hue separated by 0.45.
// -------------------------------------------------------

var speed = 0.04
var helixWidth = 0.08

export function sliderSpeed(v) { speed = mix(0.015, 0.08, v) }
export function sliderWidth(v) { helixWidth = mix(0.03, 0.15, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  var t = time(speed)

  // Two strands with opposite phase, offset per layer for helix twist
  var strand1 = wave(t + layerPhase * 0.8)
  var strand2 = wave(t + layerPhase * 0.8 + 0.5)

  var d1 = abs(x - strand1)
  var d2 = abs(x - strand2)

  var b1 = max(0, 1 - d1 / helixWidth)
  var b2 = max(0, 1 - d2 / helixWidth)
  b1 = b1 * b1
  b2 = b2 * b2

  // Each strand gets a distinct hue that shifts over time
  var hue1 = time(0.07) + layerPhase * 0.1
  var hue2 = hue1 + 0.45

  // Rungs between strands where they're close
  var strandDist = abs(strand1 - strand2)
  var rung = 0
  if (strandDist > 0.05) {
    var mid = (strand1 + strand2) / 2
    var span = strandDist / 2
    var xFromMid = abs(x - mid)
    if (xFromMid < span) {
      // Thin rungs at regular intervals along x
      var rungPattern = wave(x * 12 + t * 2)
      rung = (rungPattern > 0.85) ? (1 - xFromMid / span) * 0.4 : 0
    }
  }

  // Blend the two strands
  if (b1 > b2) {
    hsv(hue1, 0.7 + b1 * 0.3, max(b1, rung))
  } else {
    hsv(hue2, 0.7 + b2 * 0.3, max(b2, rung))
  }
}
