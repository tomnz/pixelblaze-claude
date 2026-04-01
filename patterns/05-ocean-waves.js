// Ocean Waves — Pattern ID: kj5t4NmPxRLQHPQQb
//
// A wave crest travels along the X axis of each layer with
// per-layer phase offsets creating rolling depth planes of
// water. Subtle ripple texture overlays the main crest.
//
// Design: smoothstep() for natural crest shape. Separate fast
// ripple wave adds surface texture. Hue centered at ocean blue
// (0.58) with per-layer depth shift and brightness desaturation
// toward white foam on crests. Crest width is slider-adjustable.

var waveSpeed = 0.06
var crestWidth = 0.2 // half-width of the wave crest in x-space
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

// How fast the waves roll across the display
export function sliderWaveSpeed(v) { waveSpeed = mix(0.02, 0.15, v) }
// How wide each wave crest appears
export function sliderCrestWidth(v) { crestWidth = mix(0.05, 0.45, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(waveSpeed)
  var tRipple = time(waveSpeed * 3) // faster separate time for surface ripple texture
  var wavePos = mod(t + layerPhase * 0.6, 1) // crest position, offset per layer for rolling effect
  var dist = abs(mod(x - wavePos + 0.5, 1) - 0.5) // wrapped distance to nearest crest
  var bright = max(0, 1 - dist / crestWidth) // linear falloff from crest center
  bright = smoothstep(0, 1, bright) // smooth crest shape (cubic hermite)
  var ripple = wave(x * 4 - tRipple + layerPhase * 1.5) * 0.15 // small surface texture
  bright = clamp(bright + ripple, 0, 1)
  // Hue 0.58 = ocean blue; shifts greener at depth, whiter at crest
  var hue = 0.58 + layerPhase * 0.08 - bright * 0.08 + wave(x * 2 + t) * 0.03
  var sat = 1 - bright * 0.5 // desaturate toward white at crest (foam)
  hsv(hue, sat, bright)
}
