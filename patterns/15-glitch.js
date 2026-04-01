// Glitch — Pattern ID: n3vsMNMDxjfF6gDWv
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Digital glitch aesthetic. Random color blocks appear on
// individual layers, full-layer flashes fire, and per-pixel
// noise corruption sparkles across the display.
// -------------------------------------------------------
// Design: Three glitch states per layer (off/block/flash) with
// random timers. Intensity slider controls probability of active
// states. Background noise uses high-frequency wave threshold
// (>0.97) for sparse random pixel hits.
// -------------------------------------------------------

var glitchState = array(32)
var glitchHue = array(32)
var glitchOffset = array(32)
var glitchTimer = array(32)
var intensity = 0.7
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
for (i = 0; i < 32; i++) {
  glitchState[i] = 0
  glitchTimer[i] = random(0.3)
}

export function sliderIntensity(v) { intensity = v }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  var i
  for (i = 0; i < numLayers; i++) {
    glitchTimer[i] = glitchTimer[i] - dt
    if (glitchTimer[i] <= 0) {
      var roll = random(1)
      if (roll < intensity * 0.4) {
        glitchState[i] = 1
        glitchHue[i] = random(1)
        glitchOffset[i] = random(1)
        glitchTimer[i] = random(0.15) + 0.02
      } else if (roll < intensity * 0.55) {
        glitchState[i] = 2
        glitchHue[i] = random(1)
        glitchTimer[i] = random(0.06) + 0.01
      } else {
        glitchState[i] = 0
        glitchTimer[i] = random(0.4) + 0.05
      }
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var state = glitchState[layer]
  var bright = 0
  var hue = 0
  var sat = 0.9
  if (state == 1) {
    var blockCenter = glitchOffset[layer]
    var blockWidth = 0.15 + random(0.2)
    var dx = abs(x - blockCenter)
    if (dx < blockWidth) {
      bright = 0.8 + random(0.2)
      hue = glitchHue[layer] + x * 0.1
    }
  } else if (state == 2) {
    bright = 0.7 + random(0.3)
    hue = glitchHue[layer]
    sat = 0.3 + random(0.4)
  }
  var t = time(0.003)
  var noiseChance = wave(x * 17 + layer * 3.7 + t * 5)
  if (noiseChance > 0.97 && intensity > 0.3) {
    bright = max(bright, 0.5)
    hue = t + x
  }
  hsv(hue, sat, bright)
}
