// Fireflies — Pattern ID: sFcRqwv7ves6C98CK
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Random bright sparks appear and fade across layers.
// Each spark has its own position, color, and lifetime.
// A soft ambient shimmer keeps all layers faintly glowing
// like a twilight meadow, with fireflies drifting on top.
// -------------------------------------------------------
// Design: 30 particle slots at spawn rate 15/sec. Wider
// glow radius (0.12) than original. Ambient shimmer via
// overlapping slow waves gives 0.03-0.07 base brightness
// so the display is never fully dark between fireflies.
// Fireflies drift slightly in X during their lifetime.
// -------------------------------------------------------

var MAX_FLIES = 30
var flyX = array(MAX_FLIES)
var flyLayer = array(MAX_FLIES)
var flyAge = array(MAX_FLIES)
var flyLife = array(MAX_FLIES)
var flyHue = array(MAX_FLIES)
var flyActive = array(MAX_FLIES)
var spawnRate = 15
var nextSpawn = 0

var i
for (i = 0; i < MAX_FLIES; i++) {
  flyActive[i] = 0
}

export function sliderDensity(v) { spawnRate = mix(5, 30, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  nextSpawn = nextSpawn - dt

  var i
  for (i = 0; i < MAX_FLIES; i++) {
    if (flyActive[i]) {
      flyAge[i] = flyAge[i] + dt
      // Slight drift in x
      flyX[i] = flyX[i] + (wave(flyAge[i] * 2 + i * 0.3) - 0.5) * dt * 0.15
      if (flyAge[i] > flyLife[i]) flyActive[i] = 0
    }
  }

  // Can spawn multiple per frame at high rates
  while (nextSpawn <= 0) {
    nextSpawn = nextSpawn + 1 / spawnRate
    for (i = 0; i < MAX_FLIES; i++) {
      if (!flyActive[i]) {
        flyX[i] = random(1)
        flyLayer[i] = floor(random(7.99))
        flyAge[i] = 0
        flyLife[i] = random(0.8) + 0.3
        flyHue[i] = random(1)
        flyActive[i] = 1
        break
      }
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var layerPhase = layer / 8

  // Ambient twilight shimmer — slow overlapping waves per layer
  var tAmb1 = time(0.06)
  var tAmb2 = time(0.09)
  var ambient = wave(x * 2 + tAmb1 + layerPhase * 2.5) * wave(x * 3.5 - tAmb2 + layerPhase * 1.7)
  ambient = ambient * 0.06 + 0.02
  var ambHue = time(0.08) + layerPhase * 0.15 + x * 0.05

  var bright = 0
  var hue = ambHue
  var i
  for (i = 0; i < MAX_FLIES; i++) {
    if (!flyActive[i]) continue
    if (flyLayer[i] != layer) continue
    var dx = abs(x - flyX[i])
    if (dx > 0.12) continue
    // Fade in fast, fade out slow
    var lifeFrac = flyAge[i] / flyLife[i]
    var glow
    if (lifeFrac < 0.15) {
      glow = lifeFrac / 0.15
    } else {
      glow = 1 - (lifeFrac - 0.15) / 0.85
    }
    var b = glow * (1 - dx / 0.12)
    b = b * b
    if (b > bright) {
      bright = b
      hue = flyHue[i]
    }
  }

  // Combine firefly brightness with ambient
  bright = max(bright, ambient)
  hsv(hue, 0.5 + bright * 0.4, bright)
}
