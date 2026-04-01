// Fire — Pattern ID: y5qec8aPTGZWj6TmP
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Symmetric fire: both edges white-hot, center deep red.
// Dual Perlin noise layers for organic flickering texture.
// Front layers burn brighter than back layers.
// -------------------------------------------------------
// Design: perlinFbm with two octaves at different scales for
// natural fire turbulence. Edge distance drives hue (white
// edges to red center) and saturation. Front-to-back brightness
// falloff (50%) creates depth. Delta-based time accumulator.
// -------------------------------------------------------

setPerlinWrap(8, 32, 8)

var intensity = 0.8
var t1 = 0
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderIntensity(v) { intensity = mix(0.3, 1.0, v) }

export function beforeRender(delta) {
  t1 = (t1 + delta / 1000) % 1000
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var edgeDist = 1 - abs(x - 0.5) * 2
  var noise1 = perlinFbm(x * 4, t1 * 1.5, layer * 0.8, 2, 0.6, 3)
  var noise2 = perlinFbm(x * 6 + 10, t1 * 2.2, layer * 1.1, 2, 0.5, 2)
  var noise = clamp((noise1 + noise2 * 0.4) * 0.7 + 0.5, 0, 1)
  var bright = noise * intensity * (1 - layerPhase * 0.5)
  var hue = mix(0.1, 0.0, edgeDist) + noise2 * 0.04
  var sat = mix(0.15, 1.0, edgeDist + (1 - noise) * 0.2)
  hsv(hue, clamp(sat, 0, 1), bright)
}
