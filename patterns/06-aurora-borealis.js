// Aurora Borealis — Pattern ID: hWrLhGfHrpw9xSjy6
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Slow sinuous bands of cool color drift along each layer.
// Each layer has its own phase, hue, and wave structure,
// creating the layered shimmer of northern lights curtains.
// -------------------------------------------------------
// Design: Uses separate time() calls at different rates to
// avoid sawtooth wrap glitches (t*0.71 → time(speed*0.71)).
// Per-layer wave frequencies (freq1 = 2 + layer*0.4) give
// each layer unique character. Wide hue spread (layerPhase
// * 0.6 = 60% of color wheel) ensures strong layer contrast.
// Min brightness 0.04 keeps layers faintly visible.
// -------------------------------------------------------

var driftSpeed = 0.05

export function sliderDriftSpeed(v) { driftSpeed = mix(0.02, 0.12, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  // Separate time bases avoid sawtooth-wrap discontinuities
  var t1 = time(driftSpeed)
  var t2 = time(driftSpeed * 0.71)
  var t3 = time(driftSpeed * 1.3)
  var tHue = time(0.09)
  var tHue2 = time(0.07)

  // Each layer has distinctly different wave frequencies and phases
  var freq1 = 2 + layer * 0.4
  var freq2 = 1.5 + layer * 0.3
  var phase1 = layerPhase * 2.5
  var phase2 = layerPhase * 1.7

  var b1 = wave(x * freq1 - t1 + phase1)
  var b2 = wave(x * freq2 + t2 + phase2)
  var b3 = wave(x * (3 + layer * 0.2) - t3 + layerPhase * 3)

  // Combine waves differently per layer for unique shimmer character
  var bright = b1 * b2
  bright = max(bright, b3 * 0.45)
  bright = max(bright, 0.04)

  // Wide hue spread: each layer gets a distinct slice of the spectrum
  // layerPhase * 0.6 spreads layers across 60% of the color wheel
  var hue = tHue + layerPhase * 0.6 + wave(x * 1.5 + tHue2 + layerPhase * 2) * 0.06
  var sat = 0.6 + bright * 0.3

  hsv(hue, clamp(sat, 0, 1), bright)
}
