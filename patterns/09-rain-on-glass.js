// Rain on Glass — Pattern ID: BrnsY9gYHDTFESbWK
//
// Bright drops appear at random X positions on the front layer
// and propagate through to back layers with delay and dimming,
// like rain hitting glass and light rippling through depth.
//
// Design: 20-slot particle pool with age-based lifecycle. Each
// drop propagates back through layers via time delay (propSpeed).
// Brightness combines spatial falloff, temporal fade, and
// per-layer dimming. Hue shifts slightly per layer for depth.

// Particle pool for raindrop simulation
var MAX_DROPS = 20
var dropX = array(MAX_DROPS) // x position where each drop lands
var dropAge = array(MAX_DROPS) // seconds since drop spawned (drives propagation)
var dropActive = array(MAX_DROPS) // 1 = active, 0 = available for reuse
var dropHue = array(MAX_DROPS) // hue of each drop (blue-cyan range)
var dropRate = 8 // drops per second
var propSpeed = 2.5 // seconds for drop to propagate front-to-back
var dropWidth = 0.07 // spatial width of each drop along X
var nextDrop = 0 // countdown until next drop spawns
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

var i
for (i = 0; i < MAX_DROPS; i++) { dropActive[i] = 0 } // all slots start inactive

// How many raindrops fall at once
export function sliderDropRate(v) { dropRate = mix(2, 20, v) }
// How quickly each raindrop ripples through the layers
export function sliderPropagationSpeed(v) { propSpeed = mix(1, 5, 1 - v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  nextDrop = nextDrop - dt
  var i
  for (i = 0; i < MAX_DROPS; i++) {
    if (dropActive[i]) {
      dropAge[i] = dropAge[i] + dt
      if (dropAge[i] > propSpeed * 1.2 + 0.5) dropActive[i] = 0 // recycle after full propagation + fade
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
  var layerDelay = layer / max(numLayers - 1, 1) * propSpeed // time delay before drop reaches this layer
  var bright = 0
  var hue = 0.55 // default blue-cyan
  var i
  for (i = 0; i < MAX_DROPS; i++) {
    if (!dropActive[i]) continue
    var t = dropAge[i] - layerDelay // local time since drop arrived at this layer
    if (t < 0 || t > 0.5) continue // not yet arrived or already faded (0.5s visible window)
    var dx = abs(x - dropX[i])
    if (dx < dropWidth) {
      var xBright = (1 - dx / dropWidth) // spatial falloff from drop center
      var tBright = 1 - t / 0.5 // temporal fade over 0.5 seconds
      var layerBright = 1 - layer / numLayers * 0.5 // dims 50% front-to-back
      var b = xBright * tBright * layerBright
      if (b > bright) { bright = b; hue = dropHue[i] + layer / numLayers * 0.1 }
    }
  }
  hsv(hue, 0.5 + bright * 0.3, bright)
}
