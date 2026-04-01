// Thunderstorm — Pattern ID: Sd7HuJqjbGhSvETsG
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Random layers flash white (lightning). Between strikes,
// a dim blue pulse rolls front-to-back like a thunder rumble.
// -------------------------------------------------------
// Design: Per-layer flash timers with random intervals (1.5-5.5s).
// Flash brightness decays at 7x/sec for sharp lightning feel.
// Rumble is a bouncing position that creates a traveling blue
// glow across layers. Flash overrides rumble when brighter.
// -------------------------------------------------------

var flashBright = array(32)
var nextFlash = array(32)
var flashHue = array(32)
var stormIntensity = 0.7
var rumble = 0
var rumbleDir = 1
var rumbleSpeed = 0.3
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
  flashBright[i] = 0
  nextFlash[i] = random(3) + 1
  flashHue[i] = 0.65
}

export function sliderStormIntensity(v) { stormIntensity = mix(0.2, 1, v) }
export function sliderRumbleSpeed(v) { rumbleSpeed = mix(0.1, 1.5, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  rumble = rumble + rumbleSpeed * rumbleDir * dt
  if (rumble >= 1) { rumble = 1; rumbleDir = -1 }
  if (rumble <= 0) { rumble = 0; rumbleDir = 1 }
  var i
  for (i = 0; i < numLayers; i++) {
    flashBright[i] = max(0, flashBright[i] - dt * 7)
    nextFlash[i] = nextFlash[i] - dt
    if (nextFlash[i] <= 0) {
      flashBright[i] = stormIntensity * (random(0.4) + 0.6)
      flashHue[i] = 0.6 + random(0.2)
      nextFlash[i] = random(4) + 1.5
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var rumbleDist = abs(rumble - layerPhase)
  var rumbleGlow = max(0, 0.25 - rumbleDist * 1.8) * stormIntensity
  var rumbleHue = 0.62 + rumble * 0.08 + wave(x * 2 + rumble * 3) * 0.04
  var flash = flashBright[layer] * (0.85 + wave(x * 6 + layer) * 0.15)
  if (flash > rumbleGlow) {
    hsv(flashHue[layer], max(0, 0.4 - flash * 0.6), flash)
  } else {
    hsv(rumbleHue, 0.8, rumbleGlow)
  }
}
