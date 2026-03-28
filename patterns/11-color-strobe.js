// Color Strobe — Pattern ID: qSQsBYADnoHFceARu
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Maximum framerate chaos. Rapid color cycling across all
// 8 layers. Each layer gets a different slice of the
// rainbow that shifts every frame. Designed to be intense
// and disorienting.
// -------------------------------------------------------
// Design: time(0.002) for fastest possible color cycling.
// Chaos slider controls hard on/off threshold vs smooth
// waves. Random layer blackout via fast wave for extra
// punch. Per-layer hue offset (layer/8 * 0.5) ensures
// distinct colors across depth.
// -------------------------------------------------------

var speed = 0.008
var chaos = 0.7

export function sliderSpeed(v) { speed = mix(0.003, 0.02, v) }
export function sliderChaos(v) { chaos = v }

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var t = time(speed)
  var tFast = time(0.002)
  var tMed = time(0.005)

  // Base hue: rapid rainbow cycle, offset per layer
  var hue = tFast + layer / 8 * 0.5

  // X-position adds color variation within each layer
  hue = hue + x * 0.3

  // Brightness: multiple fast waves create strobing
  var b1 = wave(t + layer / 8 * 0.7)
  var b2 = wave(tMed + x * 2 + layer * 0.4)

  // Chaos mixes between smooth waves and hard on/off
  var bright = b1 * b2
  if (chaos > 0.5) {
    // Hard strobe: quantize brightness to on/off
    var thresh = (1 - chaos) * 2
    bright = bright > thresh ? 1 : 0
  }

  // Random layer blackout for extra punch
  var blackout = wave(tFast * 3 + layer * 0.37)
  if (blackout < chaos * 0.3) bright = 0

  hsv(hue, 0.7 + bright * 0.3, bright)
}
