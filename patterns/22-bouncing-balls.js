// Bouncing Balls — Pattern ID: nQBxyYaJHX72KFWqi
// -------------------------------------------------------
// Hardware: Edge-lit acrylic depth display
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via mapPixels (typically 8)
// -------------------------------------------------------
// Three balls bounce around the display with elliptical
// shapes — stretched along X (smooth within layers) and
// narrow across Y (spanning a few layers). Each ball has
// a random initial angle and slowly drifting hue.
// -------------------------------------------------------
// Design: Elliptical distance (dx/xSize)^2 + (dy/ySize)^2
// with smooth squared falloff inside the ellipse. Ball
// positions use continuous coordinates with edge reflection.
// Bright centers desaturate toward white. Speed, width, and
// height are slider-controllable.
// -------------------------------------------------------

var MAX_BALLS = 5
var numBalls = 2
var bx = array(MAX_BALLS)
var by = array(MAX_BALLS)
var bvx = array(MAX_BALLS)
var bvy = array(MAX_BALLS)
var bHue = array(MAX_BALLS)
var xSize = 0.395
var ySize = 1.45
var speedMult = 2.325

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
for (i = 0; i < MAX_BALLS; i++) {
  bx[i] = random(0.6) + 0.2
  by[i] = random(max(numLayers - 2, 1)) + 1
  var angle = random(PI2)
  bvx[i] = sin(angle) * 0.4
  bvy[i] = cos(angle) * 3
  bHue[i] = i / MAX_BALLS
}

export function sliderBalls(v) { numBalls = floor(mix(1, 5.99, v)) }
export function sliderSpeed(v) { speedMult = mix(0.3, 3, v) }
export function sliderWidth(v) { xSize = mix(0.08, 0.5, v) }
export function sliderHeight(v) { ySize = mix(0.6, 4, v) }

export function beforeRender(delta) {
  var dt = min(delta / 1000, 0.1) * speedMult
  var i
  for (i = 0; i < numBalls; i++) {
    bx[i] = bx[i] + bvx[i] * dt
    by[i] = by[i] + bvy[i] * dt

    // Bounce with ~10 degree random perturbation
    if (bx[i] < 0) { bx[i] = -bx[i]; bvx[i] = abs(bvx[i]); bvy[i] = bvy[i] + (random(0.3) - 0.15) }
    if (bx[i] > 1) { bx[i] = 2 - bx[i]; bvx[i] = -abs(bvx[i]); bvy[i] = bvy[i] + (random(0.3) - 0.15) }

    if (by[i] < 0) { by[i] = -by[i]; bvy[i] = abs(bvy[i]); bvx[i] = bvx[i] + (random(0.04) - 0.02) }
    if (by[i] > numLayers - 1) { by[i] = 2 * (numLayers - 1) - by[i]; bvy[i] = -abs(bvy[i]); bvx[i] = bvx[i] + (random(0.04) - 0.02) }

    bHue[i] = bHue[i] + dt * 0.05
  }
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))

  var bright = 0
  var hue = 0
  var sat = 0.8

  var i
  for (i = 0; i < numBalls; i++) {
    var dx = (x - bx[i]) / xSize
    var dy = (layer - by[i]) / ySize
    var dist2 = dx * dx + dy * dy

    if (dist2 < 1) {
      var b = 1 - dist2
      b = b * b
      if (b > bright) {
        bright = b
        hue = bHue[i]
        sat = 0.5 + dist2 * 0.4
      }
    }
  }

  hsv(hue, sat, bright)
}
