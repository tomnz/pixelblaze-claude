// Glitch — Pattern ID: n3vsMNMDxjfF6gDWv
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Digital glitch aesthetic. Random blocks of saturated color
// appear, shift, and corrupt across layers. Occasional
// full-layer flashes and horizontal tearing effects.
// -------------------------------------------------------
// Design: State machine per layer (0=idle, 1=color block,
// 2=full flash). Random timing creates unpredictability.
// Intensity slider controls probability of glitch events.
// Per-pixel noise corruption adds texture when intensity
// is above 0.3. Color blocks light only a segment of the
// layer for spatial variety.
// -------------------------------------------------------

var glitchState = array(8)
var glitchHue = array(8)
var glitchOffset = array(8)
var glitchTimer = array(8)
var intensity = 0.7

var i
for (i = 0; i < 8; i++) {
  glitchState[i] = 0
  glitchTimer[i] = random(0.3)
}

export function sliderIntensity(v) { intensity = v }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  var i
  for (i = 0; i < 8; i++) {
    glitchTimer[i] = glitchTimer[i] - dt
    if (glitchTimer[i] <= 0) {
      // Random chance of different glitch types
      var roll = random(1)
      if (roll < intensity * 0.4) {
        // Color block
        glitchState[i] = 1
        glitchHue[i] = random(1)
        glitchOffset[i] = random(1)
        glitchTimer[i] = random(0.15) + 0.02
      } else if (roll < intensity * 0.55) {
        // Full layer flash
        glitchState[i] = 2
        glitchHue[i] = random(1)
        glitchTimer[i] = random(0.06) + 0.01
      } else {
        // Dark / idle
        glitchState[i] = 0
        glitchTimer[i] = random(0.4) + 0.05
      }
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var state = glitchState[layer]

  var bright = 0
  var hue = 0
  var sat = 0.9

  if (state == 1) {
    // Color block: only a segment of the layer lights up
    var blockCenter = glitchOffset[layer]
    var blockWidth = 0.15 + random(0.2)
    var dx = abs(x - blockCenter)
    if (dx < blockWidth) {
      bright = 0.8 + random(0.2)
      hue = glitchHue[layer] + x * 0.1
    }
  } else if (state == 2) {
    // Full layer flash
    bright = 0.7 + random(0.3)
    hue = glitchHue[layer]
    sat = 0.3 + random(0.4)
  }

  // Occasional per-pixel noise for corruption texture
  var t = time(0.003)
  var noiseChance = wave(x * 17 + layer * 3.7 + t * 5)
  if (noiseChance > 0.97 && intensity > 0.3) {
    bright = max(bright, 0.5)
    hue = t + x
  }

  hsv(hue, sat, bright)
}
