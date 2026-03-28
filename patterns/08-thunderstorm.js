// Thunderstorm — Pattern ID: Sd7HuJqjbGhSvETsG
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Random layers flash bright white (lightning). Between
// strikes, a slow dim blue pulse rolls front-to-back
// (thunder rumble). Erratic timing creates unpredictability.
// -------------------------------------------------------
// Design: No ambient floor — dark areas are truly dark for
// high contrast between lightning and rumble. Narrow rumble
// glow (0.25 width * 1.8 falloff). Per-flash random hue
// (mostly white-blue, occasionally purple/cyan). Flash
// brightness varies with x for spatial texture.
// -------------------------------------------------------

var flashBright = array(8)
var nextFlash = array(8)
var flashHue = array(8)
var stormIntensity = 0.7
var rumble = 0
var rumbleDir = 1
var rumbleSpeed = 0.3

var i
for (i = 0; i < 8; i++) {
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
  for (i = 0; i < 8; i++) {
    flashBright[i] = max(0, flashBright[i] - dt * 7)

    nextFlash[i] = nextFlash[i] - dt
    if (nextFlash[i] <= 0) {
      flashBright[i] = stormIntensity * (random(0.4) + 0.6)
      // Vary flash color: mostly white-blue, occasionally purple or cyan
      flashHue[i] = 0.6 + random(0.2)
      nextFlash[i] = random(4) + 1.5
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  // Rumble: narrow glow sweeping through layers, hue shifts slightly
  var rumbleDist = abs(rumble - layerPhase)
  var rumbleGlow = max(0, 0.25 - rumbleDist * 1.8) * stormIntensity
  var rumbleHue = 0.62 + rumble * 0.08 + wave(x * 2 + rumble * 3) * 0.04

  // Lightning flash with x variation
  var flash = flashBright[layer] * (0.85 + wave(x * 6 + layer) * 0.15)

  if (flash > rumbleGlow) {
    hsv(flashHue[layer], max(0, 0.4 - flash * 0.6), flash)
  } else {
    hsv(rumbleHue, 0.8, rumbleGlow)
  }
}
