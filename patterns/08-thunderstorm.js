// Thunderstorm — Pattern ID: Sd7HuJqjbGhSvETsG
//
// Random layers flash white (lightning). Between strikes,
// a dim blue pulse rolls front-to-back like a thunder rumble.
//
// Design: Per-layer flash timers with random intervals (1.5-5.5s).
// Flash brightness decays at 7x/sec for sharp lightning feel.
// Rumble is a bouncing position that creates a traveling blue
// glow across layers. Flash overrides rumble when brighter.

// Per-layer lightning state arrays
var flashBright = array(32) // current flash brightness (decaying)
var nextFlash = array(32) // countdown (seconds) until next flash
var flashHue = array(32) // hue of current/last flash
var stormIntensity = 0.7
// Rumble: a position that bounces 0-1 across the layer stack
var rumble = 0
var rumbleDir = 1 // +1 = moving toward back, -1 = toward front
var rumbleSpeed = 0.3
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

// Stagger initial flash timers so they don't all fire at once
var i
for (i = 0; i < 32; i++) {
  flashBright[i] = 0
  nextFlash[i] = random(3) + 1 // 1-4 seconds until first flash
  flashHue[i] = 0.65
}

// How bright and frequent the lightning strikes are
export function sliderStormIntensity(v) { stormIntensity = mix(0.2, 1, v) }
// How fast the background thunder glow sweeps through the layers
export function sliderRumbleSpeed(v) { rumbleSpeed = mix(0.1, 1.5, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  // Bounce rumble position back and forth across layer stack
  rumble = rumble + rumbleSpeed * rumbleDir * dt
  if (rumble >= 1) { rumble = 1; rumbleDir = -1 }
  if (rumble <= 0) { rumble = 0; rumbleDir = 1 }
  var i
  for (i = 0; i < numLayers; i++) {
    flashBright[i] = max(0, flashBright[i] - dt * 7) // fast decay (~140ms to zero)
    nextFlash[i] = nextFlash[i] - dt
    if (nextFlash[i] <= 0) {
      // Trigger new lightning strike on this layer
      flashBright[i] = stormIntensity * (random(0.4) + 0.6) // 60-100% of intensity
      flashHue[i] = 0.6 + random(0.2) // blue-violet range
      nextFlash[i] = random(4) + 1.5 // next strike in 1.5-5.5 seconds
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var rumbleDist = abs(rumble - layerPhase) // how far this layer is from the rumble center
  var rumbleGlow = max(0, 0.25 - rumbleDist * 1.8) * stormIntensity // soft glow near rumble position
  var rumbleHue = 0.62 + rumble * 0.08 + wave(x * 2 + rumble * 3) * 0.04 // deep blue shifting with position
  var flash = flashBright[layer] * (0.85 + wave(x * 6 + layer) * 0.15) // slight x-variation in flash
  // Lightning flash overrides rumble glow when brighter
  if (flash > rumbleGlow) {
    hsv(flashHue[layer], max(0, 0.4 - flash * 0.6), flash) // desaturate toward white at peak
  } else {
    hsv(rumbleHue, 0.8, rumbleGlow)
  }
}
