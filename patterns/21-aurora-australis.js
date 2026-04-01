// Aurora Australis — Pattern ID: rb4BpMd2d5XDr9t3r
//
// Organic aurora using 2D Perlin noise for brightness instead
// of regular wave() functions. Noise is stretched along X
// (smooth within layers) and compressed across Y (strong
// contrast between neighboring layers).
//
// Design: perlinFbm with two overlapping noise fields at
// different scales. Stretch slider controls within-layer
// smoothness, LayerContrast slider controls between-layer
// variation. Hue uses wide per-layer spread (0.6) with
// perlin-driven modulation for organic color drift.
// Squared brightness for good contrast with 0.03 floor.

setPerlinWrap(8, 32, 256) // wrap periods for x, y (layers), z (time) axes

var driftSpeed = 0.05
var stretch = 1.5 // noise x scale: higher = smoother within layers
var compress = 2.5 // noise y scale: higher = more contrast between layers
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

var t1 = 0 // continuously advancing time coordinate for noise z-axis

// How fast the aurora drifts and evolves
export function sliderDriftSpeed(v) { driftSpeed = mix(0.02, 0.12, v) }
// How smooth or detailed the aurora looks within each layer
export function sliderStretch(v) { stretch = mix(0.5, 4, v) }
// How different neighboring layers look from each other
export function sliderLayerContrast(v) { compress = mix(1, 5, v) }

export function beforeRender(delta) {
  t1 = (t1 + delta / 1000 * driftSpeed * 10) % 256 // wraps at 256 to match setPerlinWrap z period
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers

  // Primary noise: x=position within layer, y=layer index (compressed), z=time
  var n1 = perlinFbm(x * stretch, layer * compress, t1, 2, 0.6, 3) // 2 octaves, 0.6 amplitude, 3 lacunarity

  // Secondary noise at different scale/speed; +10/+50 offsets sample uncorrelated noise regions
  var n2 = perlinFbm(x * stretch * 0.7 + 10, layer * compress * 0.8, t1 * 1.4 + 50, 2, 0.5, 2)

  // Combine: primary noise shapes, secondary adds shimmer
  var bright = clamp(n1 * 0.7 + 0.5, 0, 1)
  var shimmer = clamp(n2 * 0.5 + 0.5, 0, 1)
  bright = bright * 0.7 + shimmer * 0.3
  bright = bright * bright

  // Keep a faint floor so display is never fully dark
  bright = max(bright, 0.03)

  // Hue: wide per-layer spread with perlin-driven modulation for organic color drift
  var tHue = time(0.08) // slow global hue rotation
  var hueNoise = perlinFbm(x * 2, layer * 1.5, t1 * 0.6 + 100, 2, 0.5, 2) // +100 offset = independent noise field
  var hue = tHue + layerPhase * 0.6 + hueNoise * 0.08 // 0.6 spread = each layer has visibly distinct hue

  // Saturation: brighter regions slightly less saturated (more white)
  var sat = 0.55 + (1 - bright) * 0.35

  hsv(hue, clamp(sat, 0, 1), bright)
}
