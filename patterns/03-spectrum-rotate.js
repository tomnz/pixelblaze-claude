// Spectrum Rotate — Pattern ID: 4RrF8eRB6yJEJXSMt
//
// Each layer gets a hue band from the spectrum. A brightness
// wave runs along each layer's 24 LEDs. The spectrum slowly
// rotates so colors shift through the depth stack.
//
// Design: Two brightness waves at different frequencies overlap
// via max() for visual complexity. Separate time() calls for
// rotation and wave speeds. Hue = rotation time + layer offset
// + subtle x gradient for intra-layer color variation.

var rotateSpeed = 0.05 // hue rotation rate through depth stack
var waveSpeed = 0.06 // brightness wave scroll rate along X
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

// How fast colors rotate through the layers
export function sliderRotateSpeed(v) { rotateSpeed = mix(0.01, 0.2, v) }
// How fast the brightness wave scrolls along each layer
export function sliderWaveSpeed(v) { waveSpeed = mix(0.02, 0.2, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t1 = time(rotateSpeed) // slow hue rotation
  var t2 = time(waveSpeed) // primary brightness wave
  var t3 = time(waveSpeed * 1.3) // secondary wave; separate time() avoids wrap glitch
  // Full spectrum across layers (layerPhase adds 1.0); x adds subtle intra-layer gradient
  var hue = t1 + layerPhase + x * 0.15
  var bright = wave(x - t2 + layerPhase * 0.3) // primary wave scrolling along X
  var bright2 = wave(x * 2.5 + t3 - layerPhase * 0.5) // higher-freq secondary wave
  bright = max(bright * bright, bright2 * 0.4) // overlap via max() for complexity
  hsv(hue, 0.85, bright)
}
