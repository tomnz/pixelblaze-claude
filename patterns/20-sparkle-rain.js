// Sparkle Rain — Pattern ID: Agp2JmNK4ot3a4XsA
//
// Dense sparkling particles cascade front-to-back through
// layers like falling glitter. Sparks drift slightly along X
// as they fall for organic motion.
//
// Design: 30-slot particle pool, each spark falls through
// continuous layer space with sub-layer interpolation for
// smooth transitions. Tight spatial glow (0.06 X radius).
// Density and fall speed are slider-controllable.

// Particle pool: per-spark x position, continuous layer position, age, hue, and active flag
var MAX_SPARKS = 30
var sparkX = array(MAX_SPARKS)
var sparkLayer = array(MAX_SPARKS)
var sparkAge = array(MAX_SPARKS)
var sparkHue = array(MAX_SPARKS)
var sparkActive = array(MAX_SPARKS)
var spawnRate = 15
var nextSpawn = 0
var fallSpeed = 1.5
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
for (i = 0; i < MAX_SPARKS; i++) { sparkActive[i] = 0 }

// How many sparkling particles rain down at once
export function sliderDensity(v) { spawnRate = mix(5, 30, v) }
// How quickly the sparks cascade through the layers
export function sliderFallSpeed(v) { fallSpeed = mix(0.5, 4, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  nextSpawn = nextSpawn - dt
  var i
  for (i = 0; i < MAX_SPARKS; i++) {
    if (sparkActive[i]) {
      sparkAge[i] = sparkAge[i] + dt
      sparkLayer[i] = sparkLayer[i] + fallSpeed * dt // continuous fall through layer space
      if (sparkLayer[i] > numLayers - 0.5) sparkActive[i] = 0
      sparkX[i] = sparkX[i] + (wave(sparkAge[i] * 3 + i) - 0.5) * dt * 0.3 // slight X drift for organic motion
    }
  }
  while (nextSpawn <= 0) {
    nextSpawn = nextSpawn + 1 / spawnRate
    for (i = 0; i < MAX_SPARKS; i++) {
      if (!sparkActive[i]) {
        sparkX[i] = random(1)
        sparkLayer[i] = 0
        sparkAge[i] = 0
        sparkHue[i] = random(1)
        sparkActive[i] = 1
        break
      }
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var bright = 0
  var hue = 0
  var i
  for (i = 0; i < MAX_SPARKS; i++) {
    if (!sparkActive[i]) continue
    var layerDist = abs(sparkLayer[i] - layer)
    if (layerDist > 1) continue // only visible on current and adjacent layers
    var dx = abs(x - sparkX[i])
    if (dx > 0.06) continue // tight 0.06 X radius for point-like sparkle
    var spatial = (1 - dx / 0.06) * (1 - layerDist) // combined X and layer proximity falloff
    var b = spatial * spatial // squared for sharp bright center
    if (b > bright) { bright = b; hue = sparkHue[i] }
  }
  hsv(hue, 0.5 + bright * 0.4, bright)
}
