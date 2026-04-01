// Bouncing Balls — Pattern ID: nQBxyYaJHX72KFWqi
//
// Balls bounce around the display with elliptical shapes —
// stretched along X (smooth within layers) and narrow across Y
// (spanning a few layers). Each ball has a random initial angle
// and slowly drifting hue.
//
// Design: Elliptical distance (dx/xSize)^2 + (dy/ySize)^2
// with smooth squared falloff inside the ellipse. Ball
// positions use continuous coordinates with edge reflection.
// Bright centers desaturate toward white. Speed, width, and
// height are slider-controllable.

// Per-ball arrays: position (x, y in layer space), velocity, and hue
var MAX_BALLS = 5
var numBalls = 2
var bx = array(MAX_BALLS)
var by = array(MAX_BALLS) // y is in continuous layer-index space (0 to numLayers-1)
var bvx = array(MAX_BALLS)
var bvy = array(MAX_BALLS) // vy is in layers/sec — larger than vx because layer space is coarser
var bHue = array(MAX_BALLS)
var xSize = 0.395 // ellipse X radius in normalized x space
var ySize = 1.45 // ellipse Y radius in layer-index space
var speedMult = 2.325

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
for (i = 0; i < MAX_BALLS; i++) {
  bx[i] = random(0.6) + 0.2 // start away from edges
  by[i] = random(max(numLayers - 2, 1)) + 1
  var angle = random(PI2) // random initial direction
  bvx[i] = sin(angle) * 0.4 // x velocity in normalized units/sec
  bvy[i] = cos(angle) * 3 // y velocity in layers/sec (larger scale to match layer spacing)
  bHue[i] = i / MAX_BALLS // evenly spaced starting hues
}

// How many balls bounce around the display
export function sliderBalls(v) { numBalls = floor(mix(1, 5.99, v)) }
// How fast the balls move around the display
export function sliderSpeed(v) { speedMult = mix(0.3, 3, v) }
// How wide each ball stretches along a layer
export function sliderWidth(v) { xSize = mix(0.08, 0.5, v) }
// How many layers deep each ball spans
export function sliderHeight(v) { ySize = mix(0.6, 4, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1) * speedMult
  var i
  for (i = 0; i < numBalls; i++) {
    bx[i] = bx[i] + bvx[i] * dt
    by[i] = by[i] + bvy[i] * dt

    // Edge reflection with small random perturbation to the cross-axis velocity
    if (bx[i] < 0) { bx[i] = -bx[i]; bvx[i] = abs(bvx[i]); bvy[i] = bvy[i] + (random(0.3) - 0.15) }
    if (bx[i] > 1) { bx[i] = 2 - bx[i]; bvx[i] = -abs(bvx[i]); bvy[i] = bvy[i] + (random(0.3) - 0.15) }

    // Y bounces add smaller perturbation (0.04 vs 0.3) since y is in layer units
    if (by[i] < 0) { by[i] = -by[i]; bvy[i] = abs(bvy[i]); bvx[i] = bvx[i] + (random(0.04) - 0.02) }
    if (by[i] > numLayers - 1) { by[i] = 2 * (numLayers - 1) - by[i]; bvy[i] = -abs(bvy[i]); bvx[i] = bvx[i] + (random(0.04) - 0.02) }

    bHue[i] = bHue[i] + dt * 0.05 // slow continuous hue drift
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))

  var bright = 0
  var hue = 0
  var sat = 0.8

  var i
  for (i = 0; i < numBalls; i++) {
    // Elliptical distance: normalized so dist2=1 is the ellipse boundary
    var dx = (x - bx[i]) / xSize
    var dy = (layer - by[i]) / ySize
    var dist2 = dx * dx + dy * dy

    if (dist2 < 1) {
      var b = 1 - dist2 // linear falloff from center
      b = b * b // squared for bright center, soft edges
      if (b > bright) {
        bright = b
        hue = bHue[i]
        sat = 0.5 + dist2 * 0.4 // center desaturates toward white, edges are more colorful
      }
    }
  }

  hsv(hue, sat, bright)
}
