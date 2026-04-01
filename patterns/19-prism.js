// Prism — Pattern ID: SFn2GnJP56XENkHvi
//
// Wide white beam sweeps across layers, splitting into a
// rainbow spectrum. Front layers are white and narrow, back
// layers are saturated rainbow with wider spread.
//
// Design: Beam width increases with layer depth (0.25 to 0.5).
// Saturation ramps from 0 (front/white) to 0.9 (back/color).
// Refraction offset spreads beam position per layer using a
// slow wave modulator. Shimmer overlay adds sparkle texture.

var speed = 0.04
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

// How fast the light beam sweeps across the display
export function sliderSpeed(v) { speed = mix(0.02, 0.08, v) }

export function render2D(index, x, y) {
  var layer = floor((y - yMin) / (yMax - yMin + 0.0001) * (numLayers - 0.01))
  var layerPhase = layer / numLayers
  var t = time(speed)
  var tSlow = time(0.07) // slow modulator for refraction drift
  var entry = wave(t) // beam sweeps back and forth across x
  var refraction = (layerPhase - 0.5) * wave(tSlow) * 0.4 // deeper layers refract further from center
  var beamX = entry + refraction
  var width = mix(0.25, 0.5, layerPhase) // beam widens with depth (prism spreading)
  var dx = abs(x - beamX)
  var bright = max(0, 1 - dx / width)
  bright = bright * bright * 0.8 + bright * 0.2 // blend of squared (sharp) and linear (soft) falloff
  var hue = layerPhase * 0.85 + tSlow * 0.3 // front=one color, back=opposite — 0.85 spans most of hue wheel
  var sat = layerPhase * 0.9 // front layers are white (sat 0), back layers are saturated rainbow
  bright = bright * (1 - layerPhase * 0.2) // slight brightness reduction in back layers
  var shimmer = wave(x * 6 + t * 3 + layerPhase * 2) * 0.08 // sparkle texture overlay
  bright = clamp(bright + shimmer * bright, 0, 1)
  hsv(hue, sat, bright)
}
