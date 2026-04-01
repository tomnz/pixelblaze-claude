// Meteor Shower — Pattern ID: eBnciMpBWWAyrD5qk
//
// Bright streaks with fading trails race across each layer's
// LEDs. Deterministic speed spread ensures adjacent layers
// always look different.
//
// Design: Per-layer position/velocity arrays with golden-ratio
// initial spacing. Squared falloff for sharp meteor heads with
// soft tails. Delta-based animation for framerate independence.
// Hue drifts per layer at different rates for color variety.

// Per-layer meteor state: position, velocity, and hue
var pos = array(32)
var vel = array(32)
var col = array(32)
var trailLen = 0.25 // trail length in x-space (0-1)
var speedMult = 1
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

// Initialize with golden-ratio spacing so meteors start well-distributed
var i
for (i = 0; i < 32; i++) {
  pos[i] = mod(i * 0.618, 1) // golden ratio (phi-1) for even initial spread
  vel[i] = 0.15 + mod(i * 5, 32) / 32 * 0.45 // deterministic speed 0.15-0.60
  col[i] = i / 32 // evenly distributed starting hues
}

// How fast the meteors streak across each layer
export function sliderSpeed(v) { speedMult = mix(0.3, 3, v) }
// How long the fading tail is behind each meteor
export function sliderTrailLength(v) { trailLen = mix(0.05, 0.5, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1) // cap dt to prevent jumps on lag spikes
  var i
  for (i = 0; i < numLayers; i++) {
    pos[i] = mod(pos[i] + vel[i] * speedMult * dt, 1) // wrap around at edges
    col[i] = mod(col[i] + dt * 0.03 * (i + 1), 1) // hue drifts faster on deeper layers
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var head = pos[layer]
  var dist = mod(head - x + 1, 1) // distance behind the meteor head (wrapping)
  var bright = 0
  if (dist <= trailLen) {
    bright = 1 - dist / trailLen
    bright = bright * bright // squared falloff: sharp head with soft tail
  }
  var hue = col[layer] + dist * 0.15 // hue shifts along the trail
  hsv(hue, 0.7 + dist * 0.3, bright) // more saturated toward the tail
}
