// Fire — Pattern ID: y5qec8aPTGZWj6TmP
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Flickering warm colors animate along each layer's LEDs.
// Both edges burn hot and bright (yellow-white), center
// glows deep red — like looking into the heart of a flame.
// Front layers are brighter, back layers dimmer.
// -------------------------------------------------------
// Design: Symmetric via edgeDist = 1 - abs(x - 0.5) * 2.
// Dual Perlin noise layers for richer texture. Edge pixels
// are yellow-white (hue ~0.1, low sat), center is deep red
// (hue ~0.0, high sat). Uses setPerlinWrap and perlinFbm.
// -------------------------------------------------------

setPerlinWrap(8, 32, 8)

var intensity = 0.8
var t1 = 0

export function sliderIntensity(v) { intensity = mix(0.3, 1.0, v) }

export function beforeRender(delta) {
  t1 = (t1 + delta / 1000) % 1000
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  // Distance from center: 0 at edges, 1 at middle
  var edgeDist = 1 - abs(x - 0.5) * 2

  // Two noise layers for richer flicker
  var noise1 = perlinFbm(x * 4, t1 * 1.5, layer * 0.8, 2, 0.6, 3)
  var noise2 = perlinFbm(x * 6 + 10, t1 * 2.2, layer * 1.1, 2, 0.5, 2)
  var noise = clamp((noise1 + noise2 * 0.4) * 0.7 + 0.5, 0, 1)

  var bright = noise * intensity * (1 - layerPhase * 0.5)

  // Edges = yellow-white (hue ~0.1, low sat), center = deep red (hue ~0.0, high sat)
  var hue = mix(0.1, 0.0, edgeDist) + noise2 * 0.04
  var sat = mix(0.15, 1.0, edgeDist + (1 - noise) * 0.2)

  hsv(hue, clamp(sat, 0, 1), bright)
}
