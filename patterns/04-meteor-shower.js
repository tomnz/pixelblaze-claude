// Meteor Shower — Pattern ID: eBnciMpBWWAyrD5qk
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along 24 LEDs within a layer
//   y (0-1) = which layer (front-to-back depth)
//   Layer index: floor(y * 7.99) → 0-7
// -------------------------------------------------------
// Bright streaks with fading trails race across each
// layer's LEDs. Each layer has a different speed and
// starting position, suggesting objects at different
// depths flying past.
// -------------------------------------------------------
// Design: Per-layer arrays for position, velocity, and
// color. Colors slowly drift over time. Trail hue shifts
// from hot head to cool tail. Squared brightness falloff
// for sharp head with smooth fade.
// -------------------------------------------------------

var pos = array(8)
var vel = array(8)
var col = array(8)
var trailLen = 0.25
var speedMult = 1

var i
for (i = 0; i < 8; i++) {
  pos[i] = random(1)
  vel[i] = random(0.4) + 0.2
  col[i] = random(1)
}

export function sliderSpeed(v) { speedMult = mix(0.3, 3, v) }
export function sliderTrailLength(v) { trailLen = mix(0.05, 0.5, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1)
  var i
  for (i = 0; i < 8; i++) {
    pos[i] = mod(pos[i] + vel[i] * speedMult * dt, 1)
    // Slowly drift each meteor's color
    col[i] = mod(col[i] + dt * 0.03 * (i + 1), 1)
  }
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)
  var head = pos[layer]
  var dist = mod(head - x + 1, 1)
  var bright = 0
  if (dist <= trailLen) {
    bright = 1 - dist / trailLen
    bright = bright * bright
  }
  // Hue shifts along the trail from hot head to cool tail
  var hue = col[layer] + dist * 0.15
  hsv(hue, 0.7 + dist * 0.3, bright)
}
