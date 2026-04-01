// Plasma — Pattern ID: 3asuCmP5ExnG943EC
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Classic sine-interference plasma. Three overlapping wave
// fields with large per-layer phase offsets create swirling
// color patterns across all layers simultaneously.
// -------------------------------------------------------
// Design: Three wave() calls at different x frequencies (3, 1.7,
// 4.5) and speeds, averaged for smooth plasma field. Large
// per-layer phase offsets (1.5, 2.3, 0.9) ensure strong
// inter-layer contrast. Base brightness floor of 0.1.
// -------------------------------------------------------

var speed1 = 0.04
var speed2 = 0.03
var speed3 = 0.05
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderSpeed(v) {
  speed1 = mix(0.01, 0.08, v)
  speed2 = mix(0.008, 0.06, v)
  speed3 = mix(0.012, 0.1, v)
}

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t1 = time(speed1)
  var t2 = time(speed2)
  var t3 = time(speed3)
  var v1 = wave(x * 3 + t1 + layerPhase * 1.5)
  var v2 = wave(x * 1.7 - t2 + layerPhase * 2.3 + wave(t3 + layerPhase) * 0.5)
  var v3 = wave(x * 4.5 + t3 + layerPhase * 0.9)
  var plasma = (v1 + v2 + v3) / 3
  var hue = plasma + t1 + layerPhase * 0.15
  var bright = 0.1 + plasma * 0.7
  var sat = 0.7 + (1 - plasma) * 0.3
  hsv(hue, sat, bright)
}
