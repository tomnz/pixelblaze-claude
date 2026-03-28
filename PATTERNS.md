# PixelBlaze Pattern Library

## Hardware Recap
- **8x24 LED grid** — 8 layers × 24 LEDs per layer
- Layers are stacked **front-to-back** (depth display)
- LEDs enter each acrylic panel from the **bottom edge**
- `x` (0–1): position along 24 LEDs within a layer
- `y` (0–1): which layer — **use `floor(y * 7.99)`** to get layer index 0–7. PixelBlaze normalizes y independently to 0–1.

## General Pattern-Writing Approach

### The Two Axes of Animation
Every good pattern for this display works on two levels simultaneously:

1. **Intra-layer (X axis):** What's happening along the 24 LEDs of a single layer — waves, pulses, sparks, gradients. This is fully visible because light from each LED diffracts through the acrylic separately.

2. **Inter-layer (Y axis):** How the 8 layers relate to each other — phase offsets, timing delays, hue shifts, sequential triggers. Since Y is only 8 discrete steps, don't rely on smooth Y gradients. Instead, use `layer = floor(y * 7.99)` to drive per-layer variation.

### Code Structure Template
```js
// Per-frame state
var t1, t2;

export function beforeRender(delta) {
  t1 = time(0.1)  // slow cycle
  t2 = time(0.04) // faster cycle
}

export function render2D(index, x, y) {
  var layer = floor(y * 7.99)                  // 0–7, which acrylic layer
  var layerPhase = layer / 8                    // 0–1, normalized layer offset

  // Intra-layer: something varies with x
  // Inter-layer: something varies with layer or layerPhase

  hsv(hue, sat, val)
}
```

### Brightness Guideline: ~20% Average
Target roughly 20% average brightness across all 192 pixels at any moment. Quick checks:
- Steady patterns: keep most pixels at 0.1–0.4 brightness continuously
- Event patterns (rain, lightning): add a faint ambient floor (0.03–0.06) so the display never goes fully black between events
- Pulsing patterns: ensure the cycle average stays near 20%, even if individual frames go higher or lower
- Avoid chaining many multiplications (e.g. `wave * wave * wave`) that drive average brightness below ~10%

### Avoiding Sawtooth Wrap Glitches
`time(interval)` returns a sawtooth 0→1. Multiplying by a non-integer fraction (`t * 0.35`) causes a visible discontinuity when the sawtooth wraps. **Use a separate `time()` call** with the adjusted interval instead:
```js
// BAD — jumps when t wraps:  var t = time(0.05); wave(x + t * 0.35)
// GOOD — smooth:             var t2 = time(0.05 * 0.35); wave(x + t2)
```

### Key Idioms
- `layer / 8` — normalize layer index to 0–1 for smooth per-layer offsets
- `wave(t1 + layerPhase * offset)` — same wave, phase-shifted per layer
- `triangle(t1 + layerPhase)` — ping-pong animation staggered across layers
- `random(1)` in `beforeRender` per layer for stochastic effects — use arrays indexed by layer

---

## Pattern Catalogue

### 1. Strobe Front-to-Back
**Concept:** Each layer lights up in sequence — front to back — then repeats. Clean and dramatic.
**Intra-layer:** Solid color or simple brightness gradient across 24 LEDs.
**Inter-layer:** Only the current "active" layer is lit; others are dark or dim.
**Key variables:** Speed, color, trail/decay length.

### 2. Breathing Cascade
**Concept:** All layers pulse brightness like a heartbeat, with a rolling time delay front-to-back. A wave of light moves through the depth.
**Intra-layer:** Uniform brightness (or gentle X gradient) that rises and falls.
**Inter-layer:** Each layer's pulse is offset in time by `layer / 8`.
**Key variables:** Pulse speed, phase spread, hue.

### 3. Spectrum Rotate
**Concept:** Each layer is assigned a hue band from the spectrum. A brightness wave runs along each layer's 24 LEDs. The spectrum slowly rotates so colors shift through the depth stack over time.
**Intra-layer:** Brightness wave traveling along X.
**Inter-layer:** Fixed (but slowly rotating) hue per layer.
**Key variables:** Rotation speed, wave speed, saturation.

### 4. Meteor Shower
**Concept:** Bright streaks with fading trails race across each layer's LEDs. Layers staggered in timing and speed, suggesting objects at different depths.
**Intra-layer:** Moving bright head + exponential fade trail.
**Inter-layer:** Different speed and phase per layer.
**Key variables:** Speed, trail length, meteor color, density.

### 5. Ocean Waves
**Concept:** A wave crest travels along the X axis of each layer. Each layer is at a different phase, so together they look like rolling depth layers of water.
**Intra-layer:** Bright crest with smooth falloff either side, moving along X.
**Inter-layer:** Progressive phase offset per layer.
**Key variables:** Wave speed, crest width, color (blues/cyans).

### 6. Aurora Borealis
**Concept:** Slow sinuous bands of cool color drift along each layer. Each layer has its own phase and hue, creating the layered shimmer of northern lights.
**Intra-layer:** Slow sine wave of brightness drifting along X.
**Inter-layer:** Different hue (cyan → green → violet range) and phase per layer.
**Key variables:** Drift speed, color range, wave frequency.

### 7. Fire
**Concept:** Flickering warm colors along each layer's LEDs. Front layers burn hot and bright; back layers are deeper red and dimmer — like looking through layers of flame.
**Intra-layer:** Noise-driven flicker varying brightness and hue along X.
**Inter-layer:** Front layers: white/yellow. Back layers: deep red/orange. Decreasing brightness toward back.
**Key variables:** Flicker speed, front/back color temperatures.

### 8. Thunderstorm
**Concept:** Random layers flash bright white (lightning). Between strikes a slow dim pulse rolls front-to-back (thunder rumble). Erratic timing creates unpredictability.
**Intra-layer:** Instant full-bright flash with fast decay for lightning; slow blue wash for rumble.
**Inter-layer:** Random layer selection for strikes; sequential sweep for rumble.
**Key variables:** Strike frequency, rumble speed, base ambient color.

### 9. Rain on Glass
**Concept:** Bright drops appear at random X positions and "fall through" the depth — each subsequent layer lights the same X position slightly later and dimmer.
**Intra-layer:** Sparse bright dots at specific X positions.
**Inter-layer:** A drop at layer 0 propagates to layers 1–7 over time, dimming as it goes.
**Key variables:** Drop rate, propagation speed, trail brightness decay.

### 10. Lava Lamp
**Concept:** Slow-moving blobs of warm color drift back and forth along each layer's LEDs. Each layer at a different speed and phase. Languid and organic.
**Intra-layer:** One or two smooth Gaussian-ish brightness blobs moving slowly along X.
**Inter-layer:** Different drift speed, phase, and hue per layer.
**Key variables:** Drift speed, blob width, color palette (warm or cool).

### 11. Color Strobe
**Concept:** Maximum framerate chaos. Rapid color cycling across all 8 layers with hard on/off strobing.
**Intra-layer:** Per-pixel hue varies with x position. Brightness strobes via fast wave products.
**Inter-layer:** Each layer gets a different hue slice (layer/8 * 0.5 offset). Random blackouts per layer.
**Key variables:** Speed, chaos (controls hard vs soft strobe threshold).

### 12. Plasma
**Concept:** Classic sine-interference plasma. Three overlapping wave fields create organic flowing color.
**Intra-layer:** Waves at different spatial frequencies (x*3, x*1.7, x*4.5) create complex patterns.
**Inter-layer:** Large phase offsets (1.5, 2.3, 0.9) ensure each layer has unique plasma texture.
**Key variables:** Speed (controls all three wave speeds proportionally).

### 13. Fireflies
**Concept:** Random bright sparks appear and fade across layers over a twilight ambient shimmer.
**Intra-layer:** Sparse glowing dots at random X positions with wide radius (0.12). Ambient wave shimmer.
**Inter-layer:** Fireflies spawn on random layers. Ambient shimmer varies per layer.
**Key variables:** Density (spawn rate 5-30/sec).

### 14. Pendulum Wave
**Concept:** Each layer has a bright point swinging back and forth at slightly different frequencies.
**Intra-layer:** Triangle wave gives smooth back-and-forth. Bright head with soft glow trail.
**Inter-layer:** Frequency increases per layer (1 + layer * freqSpread), creating mesmerizing phase patterns.
**Key variables:** Speed, frequency spread.

### 15. Glitch
**Concept:** Digital glitch aesthetic. Random color blocks, full-layer flashes, and pixel corruption.
**Intra-layer:** Color blocks light only segments. Per-pixel noise for corruption texture.
**Inter-layer:** Independent state machine per layer (idle / color block / flash).
**Key variables:** Intensity (controls probability and frequency of glitch events).

### 16. DNA Helix
**Concept:** Two strands weave back and forth, phase-offset through depth for a rotating double helix.
**Intra-layer:** Two wave() sinusoids with 0.5 phase offset. Thin rungs between strands.
**Inter-layer:** layerPhase * 0.8 offset creates the helix twist through depth.
**Key variables:** Speed, helix width.

### 17. Comet
**Concept:** A bright comet corkscrews through the layers leaving a fading rainbow trail.
**Intra-layer:** Spatial brightness based on distance from comet X position (wave of t + layerPhase).
**Inter-layer:** Per-layer delay creates the corkscrew path. Trail age varies per layer.
**Key variables:** Speed, trail length.

### 18. Heartbeat
**Concept:** Sharp EKG double-pulse radiates from center, cascading through layers with stagger.
**Intra-layer:** Pulse radiates outward from x=0.5. Between-beat ambient warm breathing.
**Inter-layer:** Tight stagger (layerPhase * 0.08) for quick cascade. Triple-pulse waveform.
**Key variables:** BPM, pulse width.

### 19. Prism
**Concept:** Wide white beam sweeps across layers, splitting into a rainbow spectrum with depth.
**Intra-layer:** Broad horizontal wash (width 0.25-0.5) with subtle shimmer. Front=white, back=rainbow.
**Inter-layer:** Each layer refracts beam to different X center. Saturation increases with depth.
**Key variables:** Speed.

### 20. Sparkle Rain
**Concept:** Dense sparkling particles cascade front-to-back through layers like falling glitter.
**Intra-layer:** Narrow pinpoint sparkles (0.06 radius) at random X positions with slight drift.
**Inter-layer:** Particles fall through layers (sparkLayer += fallSpeed*dt) with sub-layer interpolation.
**Key variables:** Density (spawn rate), fall speed.
