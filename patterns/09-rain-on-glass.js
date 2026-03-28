// Rain on Glass — Pattern ID: BrnsY9gYHDTFESbWK
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Bright drops appear at random X positions on the front
// layer and propagate through to back layers with a delay
// and dimming, like watching rain pass through parallel
// panes of glass.
// -------------------------------------------------------
// Design: 20 particle slots, high spawn rate (8/sec) with
// while() loop for multiple spawns per frame. Wide drops
// (0.07 radius), linear xBright (not squared) for visible
// size. No ambient glow — dark between drops for contrast.
// Per-drop random hue in blue range, hue shifts as drops
// propagate deeper. Drop visibility 0.5s for longer trails.
// -------------------------------------------------------

var MAX_DROPS = 20
var dropX = array(MAX_DROPS)
var dropAge = array(MAX_DROPS)
var dropActive = array(MAX_DROPS)
var dropHue = array(MAX_DROPS)
var dropRate = 8
var propSpeed = 2.5
var dropWidth = 0.07
var nextDrop = 0

var i
for (i = 0; i < MAX_DROPS; i++) {
  dropActive[i] = 0
}

export function sliderDropRate(v) { dropRate = mix(2, 20, v) }
export function sliderPropagationSpeed(v) { propSpeed = mix(1, 5, 1 - v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  nextDrop = nextDrop - dt

  var i
  for (i = 0; i < MAX_DROPS; i++) {
    if (dropActive[i]) {
      dropAge[i] = dropAge[i] + dt
      if (dropAge[i] > propSpeed * 1.2 + 0.5) dropActive[i] = 0
    }
  }

  // Can spawn multiple drops per frame at high rates
  while (nextDrop <= 0) {
    nextDrop = nextDrop + 1 / dropRate
    for (i = 0; i < MAX_DROPS; i++) {
      if (!dropActive[i]) {
        dropX[i] = random(1)
        dropAge[i] = 0
        dropActive[i] = 1
        dropHue[i] = 0.5 + random(0.2)
        break
      }
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerDelay = layer / 7 * propSpeed

  var bright = 0
  var hue = 0.55
  var i
  for (i = 0; i < MAX_DROPS; i++) {
    if (!dropActive[i]) continue
    var t = dropAge[i] - layerDelay
    if (t < 0 || t > 0.5) continue
    var dx = abs(x - dropX[i])
    if (dx < dropWidth) {
      var xBright = (1 - dx / dropWidth)
      var tBright = 1 - t / 0.5
      var layerBright = 1 - layer / 8 * 0.5
      var b = xBright * tBright * layerBright
      if (b > bright) {
        bright = b
        hue = dropHue[i] + layer / 8 * 0.1
      }
    }
  }

  hsv(hue, 0.5 + bright * 0.3, bright)
}
