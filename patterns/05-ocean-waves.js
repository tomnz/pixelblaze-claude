// Ocean Waves — Pattern ID: kj5t4NmPxRLQHPQQb
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// A wave crest travels along the X axis of each layer with
// per-layer phase offsets creating rolling depth planes of
// water. Subtle ripple texture overlays the main crest.
// -------------------------------------------------------
// Design: smoothstep() for natural crest shape. Separate fast
// ripple wave adds surface texture. Hue centered at ocean blue
// (0.58) with per-layer depth shift and brightness desaturation
// toward white foam on crests. Crest width is slider-adjustable.
// -------------------------------------------------------

var waveSpeed = 0.06
var crestWidth = 0.2
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderWaveSpeed(v) { waveSpeed = mix(0.02, 0.15, v) }
export function sliderCrestWidth(v) { crestWidth = mix(0.05, 0.45, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(waveSpeed)
  var tRipple = time(waveSpeed * 3)
  var wavePos = mod(t + layerPhase * 0.6, 1)
  var dist = abs(mod(x - wavePos + 0.5, 1) - 0.5)
  var bright = max(0, 1 - dist / crestWidth)
  bright = smoothstep(0, 1, bright)
  var ripple = wave(x * 4 - tRipple + layerPhase * 1.5) * 0.15
  bright = clamp(bright + ripple, 0, 1)
  var hue = 0.58 + layerPhase * 0.08 - bright * 0.08 + wave(x * 2 + t) * 0.03
  var sat = 1 - bright * 0.5
  hsv(hue, sat, bright)
}
