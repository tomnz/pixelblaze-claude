// Comet — Pattern ID: W4KtSEgev2W4bYoA5
// -------------------------------------------------------
// Hardware: Edge-lit acrylic depth display
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via mapPixels (typically 8)
// -------------------------------------------------------
// Multiple comets corkscrew through the layers with random
// spawn timing, speed, direction, color, and trail length.
// Each comet's x position sweeps via wave() with per-layer
// phase offset for helical motion through depth.
// -------------------------------------------------------
// Design: 5-slot particle pool. Each comet has random speed
// (0.4-1.0), direction (±1), trail (0.2-0.6), hue, and
// phase offset. Spawn rate slider controls frequency, with
// random jitter on timing. White-hot head desaturates,
// trail shifts through rainbow. Squared spatial falloff.
// -------------------------------------------------------

var MAX_COMETS = 5
var cAge = array(MAX_COMETS)
var cSpeed = array(MAX_COMETS)
var cDir = array(MAX_COMETS)
var cHue = array(MAX_COMETS)
var cTrail = array(MAX_COMETS)
var cActive = array(MAX_COMETS)
var cPhaseOff = array(MAX_COMETS)
var spawnTimer = 0
var spawnRate = 6
var cometWidth = 0.2

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
for (i = 0; i < MAX_COMETS; i++) { cActive[i] = 0 }

export function sliderSpawnRate(v) { spawnRate = mix(0.4, 6, v) }
export function sliderWidth(v) { cometWidth = mix(0.05, 0.25, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  spawnTimer = spawnTimer - dt

  var i
  for (i = 0; i < MAX_COMETS; i++) {
    if (cActive[i]) {
      cAge[i] = cAge[i] + dt * cSpeed[i]
      // Deactivate when trail has fully passed through all layers
      if (cAge[i] > 1.5) cActive[i] = 0
    }
  }

  // Spawn new comets
  if (spawnTimer <= 0) {
    spawnTimer = 1 / spawnRate + random(0.5)
    for (i = 0; i < MAX_COMETS; i++) {
      if (!cActive[i]) {
        cAge[i] = 0
        cSpeed[i] = random(0.6) + 0.4
        cDir[i] = random(1) > 0.5 ? 1 : -1
        cHue[i] = random(1)
        cTrail[i] = random(0.4) + 0.2
        cPhaseOff[i] = random(1)
        cActive[i] = 1
        break
      }
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers

  var bright = 0
  var hue = 0
  var sat = 0

  var i
  for (i = 0; i < MAX_COMETS; i++) {
    if (!cActive[i]) continue

    // Comet corkscrews: x position varies per layer via wave
    var cometX = wave(cAge[i] * cDir[i] + layerPhase * 0.5 + cPhaseOff[i])

    // Per-layer delay creates the corkscrew cascade
    var layerDelay = layerPhase * 0.2
    var age = cAge[i] - layerDelay
    if (age < 0) continue

    // Trail brightness
    var timeBright = 0
    if (age < cTrail[i]) {
      timeBright = 1 - age / cTrail[i]
    }
    if (timeBright <= 0) continue

    // Spatial brightness
    var dx = abs(x - cometX)
    if (dx > cometWidth) continue
    var spaceBright = 1 - dx / cometWidth
    spaceBright = spaceBright * spaceBright

    var b = spaceBright * timeBright
    if (b > bright) {
      bright = b
      // Head is white-hot, trail shifts through rainbow
      hue = cHue[i] + age * 0.8 + layerPhase * 0.15
      sat = 0.2 + age / cTrail[i] * 0.8
    }
  }

  hsv(hue, sat, bright)
}
