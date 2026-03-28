# PixelBlaze AI Assistant Context

## Hardware: 8-Layer Edge-Lit Acrylic Display

### Physical Setup
- **8x24 LED grid** mapped as a 2D display in PixelBlaze
- **8 acrylic layers** stacked **front-to-back** (depth axis), like a volumetric 3D display
- Each layer is edge-lit: **24 LEDs run along one edge** of the acrylic, and light diffuses through the entire panel
- The 2D pixel map is already configured on the device

### How Light Works in This Display
Because each layer is edge-lit from one side, **the entire acrylic panel glows** based on its edge LEDs. This means:
- The 24 LEDs on a layer's edge can create gradients or patterns visible within that layer
- But each layer is a **physically separate glowing plane** — light from one layer does not bleed into adjacent layers
- The 8 layers create **discrete depth planes**, not a continuous 3D volume

### Coordinate System (render2D)
- **X axis (0–1):** position along the 24-LED edge within a single layer
- **Y axis (0–1):** which of the 8 layers (depth/front-to-back)
- PixelBlaze normalizes x and y **independently** to 0–1, so y spans the full 0–1 range across the 8 layers (not compressed to a sub-range)
- **Layer formula:** `var layer = floor(y * 7.99)` gives the layer index 0–7. Using `7.99` instead of `8` avoids an off-by-one when `y` is exactly 1.0.
- Y is essentially a **discrete 8-step axis** — fine gradients in Y won't blend smoothly between layers
- X gradients within a single layer will be visible and effective

---

## Design Principles for This Display

### Do: Treat Each Layer as an Independent Entity
- **Per-layer effects:** animate each layer with its own color, brightness, or phase offset
- **Layer-indexed logic:** use `y` quantized to 8 steps to assign distinct properties per layer
- **Sequential/chase effects:** light layers one at a time, sweep front-to-back, or cascade
- **Layered depth illusions:** use brightness falloff by layer to simulate depth or glow
- Example pattern idiom:
  ```js
  var layer = floor(y * 7.99)  // 0–7, which layer
  var posInLayer = x            // 0–1, position along the edge
  ```

### Don't: Design for Smooth Cross-Layer Blending
- Smooth gradients across the Y axis will appear as abrupt jumps between 8 discrete planes
- Effects relying on pixel-level Y resolution (e.g. fine vertical waves) will look wrong
- Treat Y as an 8-value enum, not a continuous axis

### Effective Effect Types
The sweet spot is **combining intra-layer and inter-layer animation**:

- **Intra-layer (X axis):** waves, pulses, sparks, gradients, bouncing effects running along each layer's 24 LEDs — these look great since the acrylic diffuses the light from the bottom edge upward
- **Inter-layer (Y axis):** use per-layer phase offsets, timing delays, or distinct colors so the 8 planes relate to each other meaningfully
- **Front-to-back sweeps/pulses** that cascade through the depth stack
- **Synchronized but offset animations** — same effect on each layer but staggered in time or phase
- **Beat/rhythm effects** where different layers trigger at different times
- **Depth-based brightness or hue shifts** across layers

### Less Effective Effect Types
- Smooth gradients flowing *across* layers (Y axis is only 8 discrete steps)
- Fine-detail 2D patterns that rely on Y resolution
- Effects designed for uniform flat panels with no notion of depth

### Physical Note
LEDs enter each acrylic layer from the **bottom edge**. Light diffuses upward through the panel. This means bottom-to-top gradients within a layer are less meaningful (the whole panel glows), but left-to-right variation along the 24 LEDs is fully visible.

### Brightness Target: ~20% Average
**Target ~20% average brightness across all pixels at any given moment.** This keeps the display engaging without being harsh, and ensures the acrylic panels glow consistently rather than appearing mostly dark.

- **Steady-state patterns** (aurora, lava lamp, spectrum) should maintain close to 20% continuously
- **Event-driven patterns** (rain, lightning) can dip lower between events — darkness is part of the effect — but should still have a faint ambient layer (0.03–0.06 brightness) so the display never goes fully black
- **Pulsing patterns** (breathing, strobe) can swing well above and below 20% as long as the average over a full cycle is near 20%
- **Avoid excessive gamma curves** (e.g. cubing a wave) that push average brightness below 10%
- A quick mental check: if more than ~80% of pixels are off at any moment, the pattern likely needs an ambient floor or a wider/brighter effect region

### Animation Speed: Always Moving
Effects should never appear static. The display is meant to be visually captivating — every pattern should have constant, perceptible motion.

- No layer or region should stay at a fixed brightness for more than ~100ms
- For `time()` based animations, use values of 0.01–0.06 for primary motion (not 0.1+ which creates multi-second cycles that appear frozen)
- For `beforeRender` delta-based animations, ensure per-frame position changes are visible at 30+ fps
- Chase/strobe effects should use smooth continuous position (not `floor()` to snap to discrete layers) for fluid movement

### Color Dynamism: Never Static
Every pattern should have color variation in multiple dimensions:

- **Over time:** Hue should drift or cycle continuously — never a fixed color. Use `time(0.05–0.1)` as a slow hue offset.
- **Along X (within layers):** Add subtle hue gradients or wave-based modulation within each layer so individual LEDs aren't all the same color.
- **Across layers:** Each layer should have visibly distinct hue, not just brightness differences. Use `layerPhase * 0.1–0.3` as hue offsets.
- **Coupled to brightness:** Bright peaks can shift hue or desaturate toward white; dim regions can shift toward deeper/cooler colors.
- Avoid static `hsvPickerColor` controls as the sole color source — prefer time-varying hue with the picker as a base offset at most.

### Avoiding Sawtooth Wrap Glitches
`time(interval)` returns a sawtooth 0→1. Multiplying by a non-integer fraction (e.g., `t * 0.35`) causes a visible jump when the sawtooth wraps from 1→0. **Use a separate `time()` call** with the adjusted interval instead:
```js
// BAD — visible glitch when t wraps:
var t = time(0.05); wave(x + t * 0.35)
// GOOD — smooth, no wrap discontinuity:
var t2 = time(0.05 * 0.35); wave(x + t2)
```
Integer multiples (e.g., `t * 8`) are fine because the wrap aligns.

### Pattern File Self-Documentation
Every pattern JS file should include a header block with:
1. **Pattern name and device pattern ID** — for updating via `pixelblaze_update_pattern`
2. **Hardware context** — the 8-layer edge-lit acrylic display summary and coordinate system
3. **Effect description** — what the pattern looks like
4. **Design rationale** — key decisions, parameter choices, and gotchas

This ensures any future session can understand and modify a pattern without needing conversation history.

---

## Pattern Development Workflow

1. **Always call `docs_get_api_reference`** before writing new pattern code
2. Use `render2D(index, x, y)` — both axes are normalized 0–1
3. Use `beforeRender(delta)` for animation state updates
4. Export UI controls with `export var slider*` / `export var hue*` naming conventions
5. Test with `pixelblaze_create_pattern` — it auto-activates the new pattern
6. Iterate with `pixelblaze_update_pattern`

## Device Info
- Host: 192.168.2.97
- Pixel count: 8×24 = 192 pixels
- Pixel map: already configured for 2D
