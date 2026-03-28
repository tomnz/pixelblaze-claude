// Prism — Pattern ID: SFn2GnJP56XENkHvi
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// A wide band of white light sweeps across the layers,
// splitting into a rainbow spectrum. Each layer shows a
// different spectral color as a broad horizontal wash.
// The effect is predominantly horizontal (wide across X)
// with the prismatic split happening across the depth layers.
// -------------------------------------------------------
// Design: Wide beams (0.25-0.6 of X range) so each layer
// glows as a broad color band. Front layers are white,
// back layers are saturated rainbow. The beam sweeps
// slowly left-right while the spectral spread varies.
// -------------------------------------------------------

var speed = 0.04

export function sliderSpeed(v) { speed = mix(0.02, 0.08, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  var t = time(speed)
  var tSlow = time(0.07)

  // Beam center sweeps across X — wide gentle motion
  var entry = wave(t)

  // Each layer refracts the beam to a slightly different X center
  // Front layers stay near entry, back layers spread further apart
  var refraction = (layerPhase - 0.5) * wave(tSlow) * 0.4
  var beamX = entry + refraction

  // Wide beams: front layers are broad white wash, back layers
  // are still wide but more spread. 0.25 to 0.5 of X range.
  var width = mix(0.25, 0.5, layerPhase)

  var dx = abs(x - beamX)
  var bright = max(0, 1 - dx / width)
  // Gentle falloff, not too sharp
  bright = bright * bright * 0.8 + bright * 0.2

  // Front layer is white, back layers spread into rainbow
  // Each layer gets a distinct spectral hue
  var hue = layerPhase * 0.85 + tSlow * 0.3
  var sat = layerPhase * 0.9

  // Intensity falls off slightly toward back
  bright = bright * (1 - layerPhase * 0.2)

  // Add subtle shimmer along x within each layer
  var shimmer = wave(x * 6 + t * 3 + layerPhase * 2) * 0.08
  bright = clamp(bright + shimmer * bright, 0, 1)

  hsv(hue, sat, bright)
}
