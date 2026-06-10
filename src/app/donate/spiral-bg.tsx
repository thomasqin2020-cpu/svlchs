'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Rotating log-spiral "galaxy" field.
//
// Design constraints learned from the previous two iterations:
// - fract(t)-swept radial ridges (the original) spend most of each cycle
//   near-black and snap back when fract wraps — users read it as a frozen
//   or broken background.
// - Pure rotation with ARM_SPREAD=0.5 (the reverted 061ffd6) produced
//   near-circular arcs whose rotation about their own center is invisible.
//
// This version keeps brightness constant over time (cosine bands — no
// resets) and winds the arms tightly with log(r) so rotation is clearly
// visible. Integer arm count makes the field seam-free: cos(N·θ) is
// 2π-periodic, so no atan2 branch blending is needed.
const ARMS = 3
const WIND = 4.0 // log-spiral winding — higher = tighter arms, more visible spin
const SPEED = 0.45 // phase speed; pattern angular velocity = SPEED / ARMS rad/s
const INTENSITY = 1.25

const VERTEX_SHADER = `void main() { gl_Position = vec4(position, 1.0); }`

const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform float intensityScale;

  void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    float r = length(uv);
    float a = atan(uv.y, uv.x);

    // Primary arm field — slow continuous rotation, never resets.
    float phase = float(${ARMS}) * a + ${WIND.toFixed(2)} * log(r + 0.05) - time * ${SPEED.toFixed(4)};
    float arm = 0.5 + 0.5 * cos(phase);
    float detail = 0.5 + 0.5 * cos(phase * 2.0 + 1.7);
    float bands = pow(arm, 2.6) * (0.78 + 0.22 * detail);

    // Faint counter-rotating wisp layer for depth.
    float phase2 = -2.0 * a + 3.0 * log(r + 0.06) + time * ${(SPEED * 0.6).toFixed(4)};
    float wisp = pow(0.5 + 0.5 * cos(phase2), 3.0);

    float fall = exp(-r * 1.25);   // radial falloff to page black
    float core = exp(-r * r * 9.0); // warm center glow
    float halo = exp(-r * 2.6);

    float lum = bands * fall;

    vec3 navy  = vec3(0.014, 0.022, 0.042);
    vec3 blue  = vec3(0.16, 0.45, 0.85);
    vec3 gold  = vec3(0.72, 0.57, 0.25);
    vec3 cream = vec3(0.95, 0.87, 0.64);

    // Gold near the core, cooling to blue at the rim.
    vec3 armTint = mix(gold, blue, smoothstep(0.18, 0.9, r));

    vec3 col = navy * (0.45 + 0.55 * exp(-r * 0.8));
    col += armTint * lum * 0.85;
    col += blue * wisp * exp(-r * 1.6) * 0.10;
    col += cream * core * 0.30;
    col += gold * halo * 0.10;
    col *= intensityScale;

    // Dither to stop banding on the dark gradient.
    float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (dn - 0.5) * (1.5 / 255.0);

    gl_FragColor = vec4(col, 1.0);
  }
`

export function SpiralBg() {
  const containerRef = useRef<HTMLDivElement>(null)
  const fallbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    } catch {
      // WebGL unavailable — reveal the CSS conic-gradient fallback instead.
      if (fallbackRef.current) fallbackRef.current.style.display = 'block'
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const camera = new THREE.Camera()
    camera.position.z = 1
    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)
    const uniforms = {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2() },
      intensityScale: { value: INTENSITY },
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      renderer.setSize(w, h)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }
    onResize()
    window.addEventListener('resize', onResize)

    let raf = 0
    let lastT = performance.now()
    const animate = (now: number) => {
      raf = requestAnimationFrame(animate)
      const dt = Math.min((now - lastT) / 1000, 0.1)
      lastT = now
      uniforms.time.value += dt
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return (
    <div className="bg-anim bg-spiral" aria-hidden="true">
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <div ref={fallbackRef} className="bg-spiral-fallback" style={{ display: 'none' }} />
      <div className="bg-spiral-veil" />
    </div>
  )
}
