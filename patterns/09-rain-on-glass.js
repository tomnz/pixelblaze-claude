// Rain on Glass — Pattern ID: BrnsY9gYHDTFESbWK
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Bright drops appear at random X positions on the front layer
// and propagate through to back layers with delay and dimming,
// like rain hitting glass and light rippling through depth.
// -------------------------------------------------------
// Design: 20-slot particle pool with age-based lifecycle. Each
// drop propagates back through layers via time delay (propSpeed).
// Brightness combines spatial falloff, temporal fade, and
// per-layer dimming. Hue shifts slightly per layer for depth.
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
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

var i
for (i = 0; i < MAX_DROPS; i++) { dropActive[i] = 0 }

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
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerDelay = layer / max(numLayers - 1, 1) * propSpeed
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
      var layerBright = 1 - layer / numLayers * 0.5
      var b = xBright * tBright * layerBright
      if (b > bright) { bright = b; hue = dropHue[i] + layer / numLayers * 0.1 }
    }
  }
  hsv(hue, 0.5 + bright * 0.3, bright)
}
