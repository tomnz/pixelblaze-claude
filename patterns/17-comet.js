// Comet — Pattern ID: W4KtSEgev2W4bYoA5
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// A bright comet corkscrews through the 8 layers, leaving
// a fading rainbow trail. The spiral path means it sweeps
// across each layer at a different position.
// -------------------------------------------------------
// Design: wave(t + layerPhase * 0.5) creates a corkscrew
// spiral where each layer sees the comet at a different X
// position. Trail fades based on age (mod of time minus
// per-layer delay). Head is white-hot (sat 0.3), trail
// shifts through rainbow and becomes more saturated.
// -------------------------------------------------------

var speed = 0.03
var trailLen = 0.4
var cometWidth = 0.1

export function sliderSpeed(v) { speed = mix(0.01, 0.06, v) }
export function sliderTrail(v) { trailLen = mix(0.1, 0.8, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  var t = time(speed)

  // Comet spirals: its x-position on each layer follows a sine
  // with the layer providing phase offset (corkscrew)
  var cometX = wave(t + layerPhase * 0.5)

  // How far "behind" in the spiral is this layer?
  // The comet visits layer 0 first, then 1, 2, etc.
  var layerDelay = layerPhase * 0.15
  var age = mod(t - layerDelay, 1)

  // Trail brightness based on age
  var timeBright = 1
  if (age > trailLen) {
    timeBright = 0
  } else {
    timeBright = 1 - age / trailLen
  }

  // Spatial brightness based on distance from comet x position
  var dx = abs(x - cometX)
  var spaceBright = max(0, 1 - dx / cometWidth)
  spaceBright = spaceBright * spaceBright

  var bright = spaceBright * timeBright

  // Head is white-hot, trail shifts through rainbow
  var hue = time(0.06) + age * 0.8 + layerPhase * 0.15
  var sat = 0.3 + age * 0.7

  hsv(hue, sat, bright)
}
