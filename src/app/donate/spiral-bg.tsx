'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const VANGUARD_PALETTE: [number, number, number][] = [
  [0.04, 0.04, 0.06],
  [0.18, 0.59, 1.0],
  [0.69, 0.55, 0.23],
  [0.95, 0.84, 0.55],
  [0.69, 0.55, 0.23],
  [0.18, 0.59, 1.0],
  [0.04, 0.04, 0.06],
]
const ARMS = 5
const SPEED = 0.04
const ARM_SPREAD = 0.5
const RADIUS_GAIN = 2.0
const INTENSITY_SCALE = 1.0

const VERTEX_SHADER = `void main() { gl_Position = vec4(position, 1.0); }`

function buildFragmentShader(): string {
  const colorDecls = VANGUARD_PALETTE.map(
    (c, i) => `vec3 c${i} = vec3(${c[0].toFixed(4)}, ${c[1].toFixed(4)}, ${c[2].toFixed(4)});`,
  ).join('\n          ')
  const stops = VANGUARD_PALETTE.length
  const mixCalls = VANGUARD_PALETTE.slice(1)
    .map((_, i) => {
      const lo = (i / (stops - 1)).toFixed(4)
      const hi = ((i + 1) / (stops - 1)).toFixed(4)
      return `col = mix(col, c${i + 1}, smoothstep(${lo}, ${hi}, t));`
    })
    .join('\n          ')

  return `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform float armSpread;
    uniform float radiusGain;
    uniform float intensityScale;

    const float TWO_PI = 6.28318530718;

    vec3 getColor(float t) {
        ${colorDecls}
        vec3 col = c0;
        ${mixCalls}
        return col;
    }

    // The arm pattern at a given (radius, angle).
    // Calling this twice with the natural angle and the wrapped angle
    // (angle ± 2π) and blending between them removes the atan2 seam
    // that otherwise runs along the −x axis.
    float armPattern(float radius, float angle, float t, float spread, float gain, float jitter) {
      float total = 0.0;
      for (int i = 0; i < ${ARMS}; i++) {
        float spiral = radius * gain + angle * spread;
        total += 0.003 * float(i*i)
               / abs(fract(t + float(i) * 0.02) * 5.0 - spiral + jitter);
      }
      return total;
    }

    void main(void) {
      vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
      float t = time * ${SPEED.toFixed(4)};
      float radius = length(uv);
      float angle = atan(uv.y, uv.x);
      float jitter = mod(uv.x + uv.y, 0.2);

      // Sample the spiral on the natural angle branch and on the
      // wrapped branch (angle ± 2π). They agree everywhere except near
      // the −x seam, where one branch is the "correct" continuation of
      // the other side. Blend with a smoothstep that ramps up only as
      // |angle| approaches π.
      float angleAlt = angle + (angle < 0.0 ? TWO_PI : -TWO_PI);
      float seamW = smoothstep(2.4, 3.14159, abs(angle));
      float pNat = armPattern(radius, angle,    t, armSpread, radiusGain, jitter);
      float pAlt = armPattern(radius, angleAlt, t, armSpread, radiusGain, jitter);
      float total = mix(pNat, 0.5 * (pNat + pAlt), seamW);

      total *= intensityScale;
      vec3 finalColor = getColor(fract(total * 0.25 + t * 0.1));
      gl_FragColor = vec4(finalColor * total, 1.0);
    }
  `
}

export function SpiralBg() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Honor reduced motion: render a single static frame, no RAF loop.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      // WebGL unavailable — fall back silently to the gradient veil only.
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const camera = new THREE.Camera()
    camera.position.z = 1
    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)
    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
      armSpread: { value: ARM_SPREAD },
      radiusGain: { value: RADIUS_GAIN },
      intensityScale: { value: INTENSITY_SCALE },
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: buildFragmentShader(),
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
    if (reduceMotion) {
      // One-shot render so the page still has the spiral imagery, just frozen.
      uniforms.time.value = 8
      renderer.render(scene, camera)
    } else {
      raf = requestAnimationFrame(animate)
    }

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
      <div className="bg-spiral-veil" />
    </div>
  )
}
