// Glitch — Pattern ID: n3vsMNMDxjfF6gDWv
//
// Digital glitch aesthetic combining per-layer effects and
// global events for an unpredictable, chaotic display.
// Per-layer states: idle, color block, flash, blackout, tear.
// Global events: freeze, static burst, panel blackout, cascade reboot.
//
// Design: Per-layer state machine with weighted random transitions.
// Global events on independent timers. Intensity slider scales
// all event probabilities. Cascade reboot shuts layers off
// sequentially then snaps back.

// Per-layer state machine arrays: state, color, position, countdown, and horizontal shift
var glitchState = array(32)
var glitchHue = array(32)
var glitchOffset = array(32)
var glitchTimer = array(32)
var glitchShift = array(32)
var intensity = 0.7

// Global freeze
var freezeTimer = 0
var freezeNext = 0
var frozen = 0

// Panel blackout: random rectangular region goes dark
var blackoutActive = 0
var blackoutTimer = 0
var blackoutX1 = 0
var blackoutX2 = 0
var blackoutL1 = 0
var blackoutL2 = 0

// Static burst: all pixels become random snow
var staticActive = 0
var staticTimer = 0
var staticNext = 0

// Cascade reboot: layers shut off one by one then snap back
var rebootActive = 0
var rebootTimer = 0
var rebootProgress = 0
var rebootSpeed = 8
var rebootPhase = 0

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
for (i = 0; i < 32; i++) {
  glitchState[i] = 0
  glitchTimer[i] = random(0.3)
  glitchShift[i] = 0
}
freezeNext = random(3) + 1
staticNext = random(5) + 2

// How chaotic and frequent the glitch events are
export function sliderIntensity(v) { intensity = v }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)

  // Global freeze
  // Freeze: skip all updates so display holds static (return early)
  if (frozen) {
    freezeTimer = freezeTimer - dt
    if (freezeTimer <= 0) frozen = 0
    return
  }

  freezeNext = freezeNext - dt
  if (freezeNext <= 0 && intensity > 0.4) { // freeze only triggers above 40% intensity
    frozen = 1
    freezeTimer = random(0.15) + 0.05
    freezeNext = random(4) + 1.5
  }

  // Static burst
  if (staticActive) {
    staticTimer = staticTimer - dt
    if (staticTimer <= 0) staticActive = 0
  }
  staticNext = staticNext - dt
  if (staticNext <= 0 && intensity > 0.3) {
    staticActive = 1
    staticTimer = random(0.2) + 0.05
    staticNext = random(6) + 2
  }

  // Cascade reboot
  if (rebootActive) {
    rebootTimer = rebootTimer + dt * rebootSpeed
    if (rebootPhase == 0) {
      // Phase 0: shutting down layers one by one
      rebootProgress = rebootTimer
      if (rebootProgress >= numLayers + 1) {
        // All layers off, brief pause then snap back
        rebootPhase = 1
        rebootTimer = 0
      }
    } else {
      // Phase 1: brief darkness then snap back on
      if (rebootTimer > 0.3) {
        rebootActive = 0
        rebootPhase = 0
      }
    }
  }
  // Probabilistic spawn: higher intensity = more frequent reboots
  if (!rebootActive && random(1) < intensity * dt * 0.08) {
    rebootActive = 1
    rebootTimer = 0
    rebootProgress = 0
    rebootPhase = 0
    rebootSpeed = random(6) + 6
  }

  // Panel blackout
  if (blackoutActive) {
    blackoutTimer = blackoutTimer - dt
    if (blackoutTimer <= 0) blackoutActive = 0
  }
  if (!blackoutActive && random(1) < intensity * dt * 0.8) {
    blackoutActive = 1
    blackoutTimer = random(0.3) + 0.05
    blackoutX1 = random(0.7)
    blackoutX2 = blackoutX1 + random(0.4) + 0.1
    blackoutL1 = floor(random(numLayers - 1))
    blackoutL2 = blackoutL1 + floor(random(3)) + 1
  }

  // Per-layer state machine
  var i
  for (i = 0; i < numLayers; i++) {
    glitchTimer[i] = glitchTimer[i] - dt
    if (glitchTimer[i] <= 0) {
      // Weighted random state transition; higher intensity widens the active-state probability bands
      var roll = random(1)
      if (roll < intensity * 0.3) {
        glitchState[i] = 1 // color block
        glitchHue[i] = random(1)
        glitchOffset[i] = random(1)
        glitchShift[i] = 0
        glitchTimer[i] = random(0.15) + 0.02
      } else if (roll < intensity * 0.42) {
        glitchState[i] = 2 // full flash
        glitchHue[i] = random(1)
        glitchShift[i] = 0
        glitchTimer[i] = random(0.06) + 0.01
      } else if (roll < intensity * 0.52) {
        glitchState[i] = 3 // layer blackout
        glitchShift[i] = 0
        glitchTimer[i] = random(0.2) + 0.05
      } else if (roll < intensity * 0.62) {
        glitchState[i] = 4 // horizontal tear/shift
        glitchShift[i] = random(0.4) - 0.2 // shift range ±0.2
        glitchHue[i] = random(1)
        glitchTimer[i] = random(0.1) + 0.02
      } else {
        glitchState[i] = 0 // idle
        glitchShift[i] = 0
        glitchTimer[i] = random(0.4) + 0.05
      }
    }
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))

  // Cascade reboot: layers shut off sequentially
  if (rebootActive) {
    if (rebootPhase == 1) {
      // Full blackout pause
      hsv(0, 0, 0)
      return
    }
    // Phase 0: layers below rebootProgress are off
    if (layer < rebootProgress) {
      // Layer is "shut down" — maybe a brief white flash as it dies
      var shutDist = rebootProgress - layer
      if (shutDist < 1) {
        hsv(0, 0, (1 - shutDist) * 0.8)
        return
      }
      hsv(0, 0, 0)
      return
    }
  }

  // Static burst: random snow overrides everything
  if (staticActive) {
    var snow = random(1)
    if (snow > 0.6) {
      hsv(random(1), random(0.5), random(0.8))
    } else {
      hsv(0, 0, random(0.15))
    }
    return
  }

  // Panel blackout region
  if (blackoutActive && x >= blackoutX1 && x <= blackoutX2 && layer >= blackoutL1 && layer <= blackoutL2) {
    hsv(0, 0, 0)
    return
  }

  var state = glitchState[layer]
  var bright = 0
  var hue = 0
  var sat = 0.9

  var sx = x
  if (state == 4) sx = mod(x + glitchShift[layer], 1) // horizontal tear: shift x with wrap

  if (state == 1) {
    var blockCenter = glitchOffset[layer]
    var blockWidth = 0.15 + random(0.2)
    var dx = abs(sx - blockCenter)
    if (dx < blockWidth) {
      bright = 0.8 + random(0.2)
      hue = glitchHue[layer] + sx * 0.1
    }
  } else if (state == 2) {
    bright = 0.7 + random(0.3)
    hue = glitchHue[layer]
    sat = 0.3 + random(0.4)
  } else if (state == 3) {
    hsv(0, 0, 0)
    return
  } else if (state == 4) {
    bright = 0.5 + random(0.3)
    hue = glitchHue[layer] + sx * 0.2
    sat = 0.7
  }

  // Random pixel-level noise: high-frequency wave creates sparse sparkle across all states
  var t = time(0.003)
  var noiseChance = wave(sx * 17 + layer * 3.7 + t * 5)
  if (noiseChance > 0.96 && intensity > 0.3) {
    bright = max(bright, 0.5 + random(0.3))
    hue = t + sx
    sat = random(1)
  }

  hsv(hue, sat, bright)
}
