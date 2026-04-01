// Breathing Cascade — Pattern ID: Yg8Gg5n55jth3FcDN
//
// All layers pulse brightness like breathing, with a rolling
// time delay front-to-back. Shimmer along X adds texture
// within each layer.
//
// Design: Squared wave() for sharper pulse shape. Separate
// shimmer time() call at 5x speed avoids sawtooth glitch.
// Spread slider controls phase offset between layers.
// Hue drifts over time with per-layer and per-x offsets.

var speed = 0.06
var spread = 0.5 // phase offset between adjacent layers (higher = more stagger)
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

// How fast the breathing pulse cycles
export function sliderSpeed(v) { speed = mix(0.02, 0.15, v) }
// How much the pulse staggers between layers
export function sliderSpread(v) { spread = mix(0.1, 1, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers // 0-1 normalized layer position
  var t = time(speed)
  var tShimmer = time(speed * 5) // separate time() at 5x avoids sawtooth wrap glitch
  var bright = wave(t + layerPhase * spread) // main breathing pulse, staggered per layer
  bright = bright * bright // squared for sharper pulse shape
  var shimmer = wave(x * 3 + tShimmer + layerPhase * 2) * 0.3 // fast sparkle texture along X
  bright = clamp(bright + shimmer * bright, 0, 1) // shimmer scales with base brightness
  // Hue drifts over time; offsets per layer, per x-position, and with brightness
  var hue = time(0.07) + layerPhase * 0.15 + x * 0.08 + bright * 0.05
  hsv(hue, 0.8 - bright * 0.2, bright) // desaturate at peak brightness
}
