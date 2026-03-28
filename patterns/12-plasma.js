// Plasma — Pattern ID: 3asuCmP5ExnG943EC
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Classic sine-interference plasma adapted for 8 layers.
// Overlapping sine waves at different frequencies and
// angles create organic, flowing color fields that differ
// per layer.
// -------------------------------------------------------
// Design: Three wave fields at different speeds and spatial
// frequencies. Large per-layer phase offsets (1.5, 2.3, 0.9)
// ensure each layer has a unique plasma pattern. Plasma
// value maps directly to hue for full rainbow. Base
// brightness 0.1 ensures the display is never fully dark.
// -------------------------------------------------------

var speed1 = 0.04
var speed2 = 0.03
var speed3 = 0.05

export function sliderSpeed(v) {
  speed1 = mix(0.01, 0.08, v)
  speed2 = mix(0.008, 0.06, v)
  speed3 = mix(0.012, 0.1, v)
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  var t1 = time(speed1)
  var t2 = time(speed2)
  var t3 = time(speed3)

  // Three overlapping sine fields at different scales and speeds
  var v1 = wave(x * 3 + t1 + layerPhase * 1.5)
  var v2 = wave(x * 1.7 - t2 + layerPhase * 2.3 + wave(t3 + layerPhase) * 0.5)
  var v3 = wave(x * 4.5 + t3 + layerPhase * 0.9)

  // Combine for rich interference pattern
  var plasma = (v1 + v2 + v3) / 3

  // Map plasma value directly to hue for full rainbow
  var hue = plasma + t1 + layerPhase * 0.15
  var bright = 0.1 + plasma * 0.7
  var sat = 0.7 + (1 - plasma) * 0.3

  hsv(hue, sat, bright)
}
