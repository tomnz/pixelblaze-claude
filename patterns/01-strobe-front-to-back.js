// Strobe Front-to-Back — Pattern ID: bKWeMM74DarQrsNeR
//
// Layers light up sequentially front-to-back with a fading
// trail. Hue cycles over time and shifts per layer for a
// rainbow chase effect with smooth fluid movement.
//
// Design: Continuous position (not floor-snapped) for smooth
// motion. Trail length and speed are slider-controllable.
// Per-layer hue offset (0.3 spread) plus x modulation for
// color variation across all dimensions.

var speed = 0.03
var trailLen = 2 // number of layers in the fading trail behind the strobe
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

// How fast the strobe sweeps through the layers
export function sliderSpeed(v) { speed = mix(0.01, 0.06, v) }
// How many layers glow behind the strobe head
export function sliderTrailLength(v) { trailLen = floor(mix(0, 6, v)) }

export function render2D(index, x, y) {
  // Normalize y to layer index 0..N-1; +0.0001 prevents div-by-zero
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var t = time(speed)
  var pos = t * numLayers // continuous position across all layers
  var dist = mod(pos - layer + numLayers, numLayers) // how far behind the head this layer is
  var bright = 0
  if (dist < 1) {
    bright = 1 // layer is at the strobe head
  } else if (dist < 1 + trailLen) {
    bright = 1 - (dist - 1) / trailLen
    bright = bright * bright // squared falloff for sharp head with soft tail
  }
  // 0.3 spread across layers for rainbow chase; 0.1 x offset for intra-layer variation
  var hue = time(0.05) + layer / numLayers * 0.3 + x * 0.1
  var sat = 1 - bright * 0.3 // desaturate toward white at peak brightness
  hsv(hue, sat, bright)
}
