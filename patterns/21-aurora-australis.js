// Aurora Australis — Pattern ID: rb4BpMd2d5XDr9t3r
// -------------------------------------------------------
// Hardware: Edge-lit acrylic depth display
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via mapPixels (typically 8)
// -------------------------------------------------------
// Organic aurora using 2D Perlin noise for brightness instead
// of regular wave() functions. Noise is stretched along X
// (smooth within layers) and compressed across Y (strong
// contrast between neighboring layers).
// -------------------------------------------------------
// Design: perlinFbm with two overlapping noise fields at
// different scales. Stretch slider controls within-layer
// smoothness, LayerContrast slider controls between-layer
// variation. Hue uses wide per-layer spread (0.6) with
// perlin-driven modulation for organic color drift.
// Squared brightness for good contrast with 0.03 floor.
// -------------------------------------------------------

setPerlinWrap(8, 32, 256)

var driftSpeed = 0.05
var stretch = 1.5
var compress = 2.5
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

var t1 = 0

export function sliderDriftSpeed(v) { driftSpeed = mix(0.02, 0.12, v) }
export function sliderStretch(v) { stretch = mix(0.5, 4, v) }
export function sliderLayerContrast(v) { compress = mix(1, 5, v) }

export function beforeRender(delta) {
  t1 = (t1 + delta / 1000 * driftSpeed * 10) % 256
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers

  // Primary brightness: stretched along x, compressed across layers
  var n1 = perlinFbm(x * stretch, layer * compress, t1, 2, 0.6, 3)

  // Secondary brightness layer at different scale and speed
  var n2 = perlinFbm(x * stretch * 0.7 + 10, layer * compress * 0.8, t1 * 1.4 + 50, 2, 0.5, 2)

  // Combine: primary noise shapes, secondary adds shimmer
  var bright = clamp(n1 * 0.7 + 0.5, 0, 1)
  var shimmer = clamp(n2 * 0.5 + 0.5, 0, 1)
  bright = bright * 0.7 + shimmer * 0.3
  bright = bright * bright

  // Keep a faint floor so display is never fully dark
  bright = max(bright, 0.03)

  // Hue: wide per-layer spread with perlin-driven modulation
  var tHue = time(0.08)
  var hueNoise = perlinFbm(x * 2, layer * 1.5, t1 * 0.6 + 100, 2, 0.5, 2)
  var hue = tHue + layerPhase * 0.6 + hueNoise * 0.08

  // Saturation: brighter regions slightly less saturated (more white)
  var sat = 0.55 + (1 - bright) * 0.35

  hsv(hue, clamp(sat, 0, 1), bright)
}
