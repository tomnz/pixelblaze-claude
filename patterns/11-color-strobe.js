// Color Strobe — Pattern ID: qSQsBYADnoHFceARu
//
// Maximum framerate chaos. Rapid color cycling with hard
// on/off strobing. Each layer gets a different rainbow slice
// for a frenetic light show effect.
//
// Design: Three time() calls at different speeds (fast, medium,
// base) for layered strobe beats. Chaos slider controls hard
// threshold cutoff and random blackout probability. Per-layer
// hue offset (0.5 spread) plus x gradient for rainbow variety.

var speed = 0.008 // very fast time() interval for rapid strobing
var chaos = 0.7 // controls hard threshold and random blackout probability
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

// How fast the strobe flashes cycle
export function sliderSpeed(v) { speed = mix(0.003, 0.02, v) }
// How wild and unpredictable the flashing becomes
export function sliderChaos(v) { chaos = v }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var t = time(speed) // base strobe cycle
  var tFast = time(0.002) // fastest cycle for hue and blackout timing
  var tMed = time(0.005) // medium cycle for secondary brightness wave
  // 0.5 hue spread across layers for rainbow variety; 0.3 across X within each layer
  var hue = tFast + layer / numLayers * 0.5
  hue = hue + x * 0.3
  var b1 = wave(t + layer / numLayers * 0.7) // primary brightness wave, offset per layer
  var b2 = wave(tMed + x * 2 + layer * 0.4) // secondary wave adds x-variation
  var bright = b1 * b2
  if (chaos > 0.5) {
    // High chaos: hard threshold converts smooth wave to on/off strobe
    var thresh = (1 - chaos) * 2
    bright = bright > thresh ? 1 : 0
  }
  // Random-looking blackout: wave below threshold = dark
  var blackout = wave(tFast * 3 + layer * 0.37)
  if (blackout < chaos * 0.3) bright = 0
  hsv(hue, 0.7 + bright * 0.3, bright)
}
