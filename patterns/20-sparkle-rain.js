// Sparkle Rain — Pattern ID: Agp2JmNK4ot3a4XsA
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Dense sparkling particles cascade through the layers
// front-to-back, each leaving a brief bright flash.
// Like glitter falling through light beams.
// -------------------------------------------------------
// Design: 30 particle slots with high spawn rate (15/sec).
// Particles fall through layers via sparkLayer += fallSpeed*dt.
// Sub-layer interpolation (layerDist < 1) creates smooth
// transitions between layers. Slight x drift via wave()
// makes particles meander. Narrow spatial radius (0.06)
// for sparkle-like pinpoints.
// -------------------------------------------------------

var MAX_SPARKS = 30
var sparkX = array(MAX_SPARKS)
var sparkLayer = array(MAX_SPARKS)
var sparkAge = array(MAX_SPARKS)
var sparkHue = array(MAX_SPARKS)
var sparkActive = array(MAX_SPARKS)
var spawnRate = 15
var nextSpawn = 0
var fallSpeed = 1.5

var i
for (i = 0; i < MAX_SPARKS; i++) {
  sparkActive[i] = 0
}

export function sliderDensity(v) { spawnRate = mix(5, 30, v) }
export function sliderFallSpeed(v) { fallSpeed = mix(0.5, 4, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  nextSpawn = nextSpawn - dt

  var i
  for (i = 0; i < MAX_SPARKS; i++) {
    if (sparkActive[i]) {
      sparkAge[i] = sparkAge[i] + dt
      // Move through layers over time
      sparkLayer[i] = sparkLayer[i] + fallSpeed * dt
      if (sparkLayer[i] > 7.5) sparkActive[i] = 0
      // Slight x drift
      sparkX[i] = sparkX[i] + (wave(sparkAge[i] * 3 + i) - 0.5) * dt * 0.3
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
  var layer = floor(y * 7.99)

  var bright = 0
  var hue = 0
  var i
  for (i = 0; i < MAX_SPARKS; i++) {
    if (!sparkActive[i]) continue
    // Check if spark is on this layer (with sub-layer interpolation)
    var layerDist = abs(sparkLayer[i] - layer)
    if (layerDist > 1) continue

    var dx = abs(x - sparkX[i])
    if (dx > 0.06) continue

    var spatial = (1 - dx / 0.06) * (1 - layerDist)
    var b = spatial * spatial
    if (b > bright) {
      bright = b
      hue = sparkHue[i]
    }
  }

  hsv(hue, 0.5 + bright * 0.4, bright)
}
