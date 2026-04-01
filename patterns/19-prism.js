// Prism — Pattern ID: SFn2GnJP56XENkHvi
// -------------------------------------------------------
// Hardware: 8-layer edge-lit acrylic display (8x24 LEDs)
//   x (0-1) = position along the LEDs within a layer
//   y = which layer (front-to-back depth), auto-calibrated
//   Layer count: auto-detected via calibration (typically 8)
//   Calibration: first 2 frames discover actual y range
// -------------------------------------------------------
// Wide white beam sweeps across layers, splitting into a
// rainbow spectrum. Front layers are white and narrow, back
// layers are saturated rainbow with wider spread.
// -------------------------------------------------------
// Design: Beam width increases with layer depth (0.25 to 0.5).
// Saturation ramps from 0 (front/white) to 0.9 (back/color).
// Refraction offset spreads beam position per layer using a
// slow wave modulator. Shimmer overlay adds sparkle texture.
// -------------------------------------------------------

var speed = 0.04
var yMin = 1; var yMax = 0
var yVals = array(32); var numLayers = 0
mapPixels(function (index, x, y, z) {
  if (y < yMin) yMin = y
  if (y > yMax) yMax = y
  var isNew = 1; var j
  for (j = 0; j < numLayers; j++) { if (abs(y - yVals[j]) < 0.002) { isNew = 0; break } }
  if (isNew && numLayers < 32) { yVals[numLayers] = y; numLayers++ }
})

export function sliderSpeed(v) { speed = mix(0.02, 0.08, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(speed)
  var tSlow = time(0.07)
  var entry = wave(t)
  var refraction = (layerPhase - 0.5) * wave(tSlow) * 0.4
  var beamX = entry + refraction
  var width = mix(0.25, 0.5, layerPhase)
  var dx = abs(x - beamX)
  var bright = max(0, 1 - dx / width)
  bright = bright * bright * 0.8 + bright * 0.2
  var hue = layerPhase * 0.85 + tSlow * 0.3
  var sat = layerPhase * 0.9
  bright = bright * (1 - layerPhase * 0.2)
  var shimmer = wave(x * 6 + t * 3 + layerPhase * 2) * 0.08
  bright = clamp(bright + shimmer * bright, 0, 1)
  hsv(hue, sat, bright)
}
