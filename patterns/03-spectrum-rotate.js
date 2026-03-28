// Spectrum Rotate — Pattern ID: 4RrF8eRB6yJEJXSMt
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Each layer is assigned a hue band from the spectrum.
// A brightness wave runs along each layer's 24 LEDs.
// The full spectrum slowly rotates so colors shift through
// the depth stack.
// -------------------------------------------------------
// Design: Uses separate time() for the 1.3x speed wave to
// avoid sawtooth wrap glitch. Second brightness wave adds
// texture within each layer. Hue varies per layer AND
// along x for richer color within each row.
// -------------------------------------------------------

var rotateSpeed = 0.05
var waveSpeed = 0.06

export function sliderRotateSpeed(v) { rotateSpeed = mix(0.01, 0.2, v) }
export function sliderWaveSpeed(v) { waveSpeed = mix(0.02, 0.2, v) }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8
  var t1 = time(rotateSpeed)
  var t2 = time(waveSpeed)
  var t3 = time(waveSpeed * 1.3)
  // Hue varies per layer AND along x for richer color within each row
  var hue = t1 + layerPhase + x * 0.15
  var bright = wave(x - t2 + layerPhase * 0.3)
  // Second wave adds texture within each layer
  var bright2 = wave(x * 2.5 + t3 - layerPhase * 0.5)
  bright = max(bright * bright, bright2 * 0.4)
  hsv(hue, 0.85, bright)
}
