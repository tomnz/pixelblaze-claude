// Ocean Waves — Pattern ID: kj5t4NmPxRLQHPQQb
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// A wave crest travels along the X axis of each layer.
// Each layer is at a different phase in the wave cycle,
// so together they look like rolling depth layers of water.
// -------------------------------------------------------
// Design: Uses separate time() for ripple (3x speed) to
// avoid sawtooth wrap glitch. No ambient floor — dark
// areas are truly dark for better contrast. Hue shifts:
// crests are bright cyan-white, troughs deep blue-purple.
// Deeper layers shift toward green-blue.
// -------------------------------------------------------

var waveSpeed = 0.06
var crestWidth = 0.2

export function sliderWaveSpeed(v) { waveSpeed = mix(0.02, 0.15, v) }
export function sliderCrestWidth(v) { crestWidth = mix(0.05, 0.45, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8
  var t = time(waveSpeed)
  var tRipple = time(waveSpeed * 3)

  // Each layer offset in phase so they roll like depth layers
  var wavePos = mod(t + layerPhase * 0.6, 1)

  // Distance from crest, wrapping
  var dist = abs(mod(x - wavePos + 0.5, 1) - 0.5)
  var bright = max(0, 1 - dist / crestWidth)
  bright = smoothstep(0, 1, bright)

  // Secondary ripple for texture within each layer
  var ripple = wave(x * 4 - tRipple + layerPhase * 1.5) * 0.15
  bright = clamp(bright + ripple, 0, 1)

  // Hue shifts: crests are bright cyan-white, troughs deep blue-purple
  // Deeper layers shift toward green-blue
  var hue = 0.58 + layerPhase * 0.08 - bright * 0.08 + wave(x * 2 + t) * 0.03
  var sat = 1 - bright * 0.5
  hsv(hue, sat, bright)
}
