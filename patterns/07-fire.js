// Fire — Pattern ID: y5qec8aPTGZWj6TmP
//
// Symmetric fire: both edges white-hot, center deep red.
// Dual Perlin noise layers for organic flickering texture.
// Front layers burn brighter than back layers.
//
// Design: perlinFbm with two octaves at different scales for
// natural fire turbulence. Edge distance drives hue (white
// edges to red center) and saturation. Front-to-back brightness
// falloff (50%) creates depth. Delta-based time accumulator.

setPerlinWrap(8, 32, 8) // wrap Perlin noise at 8x32x8 for seamless tiling

var intensity = 0.8
var t1 = 0 // time accumulator for Perlin noise animation
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

// How bright and fierce the fire burns
export function sliderIntensity(v) { intensity = mix(0.3, 1.0, v) }

export function beforeRender(delta) {
  t1 = (t1 + delta / 1000) % 1000
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var edgeDist = 1 - abs(x - 0.5) * 2 // 0 at edges, 1 at center
  // perlinFbm(x, y, z, octaves, lacunarity, gain): x=position, y=time, z=layer
  var noise1 = perlinFbm(x * 4, t1 * 1.5, layer * 0.8, 2, 0.6, 3) // primary fire turbulence
  var noise2 = perlinFbm(x * 6 + 10, t1 * 2.2, layer * 1.1, 2, 0.5, 2) // secondary detail; +10 offset for decorrelation
  var noise = clamp((noise1 + noise2 * 0.4) * 0.7 + 0.5, 0, 1) // blend and bias to 0-1
  var bright = noise * intensity * (1 - layerPhase * 0.5) // front layers 50% brighter than back
  var hue = mix(0.1, 0.0, edgeDist) + noise2 * 0.04 // edges=0.0 (red/white), center=0.1 (orange)
  var sat = mix(0.15, 1.0, edgeDist + (1 - noise) * 0.2) // low sat at edges = white-hot
  hsv(hue, clamp(sat, 0, 1), bright)
}
