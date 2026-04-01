// Fireflies — Pattern ID: sFcRqwv7ves6C98CK
//
// Random bright sparks appear and fade across layers over a
// twilight ambient shimmer. Fireflies drift slightly along X
// during their lifetime for organic movement.
//
// Design: 30-slot particle pool with fast-attack/slow-decay
// envelope (0.15 rise, 0.85 fall). Ambient layer uses dual
// wave interference for subtle twilight glow (0.02-0.08).
// Density slider controls spawn rate (5-30/sec).

// Particle pool: per-firefly position, age, lifetime, hue, and active flag
var MAX_FLIES = 30
var flyX = array(MAX_FLIES)
var flyLayer = array(MAX_FLIES)
var flyAge = array(MAX_FLIES)
var flyLife = array(MAX_FLIES)
var flyHue = array(MAX_FLIES)
var flyActive = array(MAX_FLIES)
var spawnRate = 15
var nextSpawn = 0
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
for (i = 0; i < MAX_FLIES; i++) { flyActive[i] = 0 }

// How many fireflies appear at once
export function sliderDensity(v) { spawnRate = mix(5, 30, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  nextSpawn = nextSpawn - dt
  var i
  for (i = 0; i < MAX_FLIES; i++) {
    if (flyActive[i]) {
      flyAge[i] = flyAge[i] + dt
      flyX[i] = flyX[i] + (wave(flyAge[i] * 2 + i * 0.3) - 0.5) * dt * 0.15 // gentle X drift using wave for organic wandering
      if (flyAge[i] > flyLife[i]) flyActive[i] = 0
    }
  }
  while (nextSpawn <= 0) {
    nextSpawn = nextSpawn + 1 / spawnRate
    for (i = 0; i < MAX_FLIES; i++) {
      if (!flyActive[i]) {
        flyX[i] = random(1)
        flyLayer[i] = floor(random(numLayers - 0.01))
        flyAge[i] = 0
        flyLife[i] = random(0.8) + 0.3 // lifetime 0.3-1.1 seconds
        flyHue[i] = random(1)
        flyActive[i] = 1
        break
      }
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var tAmb1 = time(0.06)
  var tAmb2 = time(0.09)
  // Dual wave interference for twilight ambient shimmer
  var ambient = wave(x * 2 + tAmb1 + layerPhase * 2.5) * wave(x * 3.5 - tAmb2 + layerPhase * 1.7)
  ambient = ambient * 0.06 + 0.02 // range 0.02-0.08
  var ambHue = time(0.08) + layerPhase * 0.15 + x * 0.05
  var bright = 0
  var hue = ambHue
  var i
  for (i = 0; i < MAX_FLIES; i++) {
    if (!flyActive[i]) continue
    if (flyLayer[i] != layer) continue
    var dx = abs(x - flyX[i])
    if (dx > 0.12) continue
    var lifeFrac = flyAge[i] / flyLife[i]
    var glow
    // Fast attack (15% of life), slow decay (85%) — asymmetric envelope
    if (lifeFrac < 0.15) { glow = lifeFrac / 0.15 }
    else { glow = 1 - (lifeFrac - 0.15) / 0.85 }
    var b = glow * (1 - dx / 0.12) // linear spatial falloff within 0.12 radius
    b = b * b // squared for sharp center, soft edges
    if (b > bright) { bright = b; hue = flyHue[i] }
  }
  bright = max(bright, ambient)
  hsv(hue, 0.5 + bright * 0.4, bright)
}
