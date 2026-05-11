import { onMount, onCleanup } from "solid-js";
import * as THREE from "three";

const VERTEX = `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (200.0 / -mvPosition.z) * (0.8 + 1.2 * sin(position.x * 0.5 + position.y * 0.3));
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vDepth = -mvPosition.z;
  }
`;

const FRAGMENT = `
  varying vec2 vUv;
  varying float vDepth;
  uniform float uTime;

  float glow(float d) {
    return smoothstep(1.0, 0.0, d) * 0.45;
  }

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = glow(d);

    // Warm tint for closer particles
    float warmth = smoothstep(15.0, 30.0, vDepth);
    vec3 warmColor = vec3(0.93, 0.36, 0.13); // accent
    vec3 coolColor = vec3(0.33, 0.33, 0.33); // dim gray

    vec3 color = mix(coolColor, warmColor, warmth * 0.3);
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function CanvasBackground() {
  let container: HTMLDivElement | undefined;

  onMount(() => {
    if (!container || typeof window === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const count = 250;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 70;
      positions[i3 + 1] = (Math.random() - 0.5) * 50;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;
      speeds[i] = 0.005 + Math.random() * 0.02;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Secondary field - tiny distant dots
    const gridGeo = new THREE.BufferGeometry();
    const gridPositions = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      gridPositions[i * 3] = (Math.random() - 0.5) * 100;
      gridPositions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      gridPositions[i * 3 + 2] = -10 - Math.random() * 20;
    }
    gridGeo.setAttribute("position", new THREE.BufferAttribute(gridPositions, 3));
    const gridMat = new THREE.PointsMaterial({
      color: 0x333333,
      size: 0.04,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const grid = new THREE.Points(gridGeo, gridMat);
    scene.add(grid);

    let frame: number;
    const clock = new THREE.Clock();

    function animate() {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      material.uniforms.uTime.value = t;

      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        pos[i3 + 1] += speeds[i];
        pos[i3] += Math.sin(t * 0.5 + phases[i]) * 0.003;
        if (pos[i3 + 1] > 25) pos[i3 + 1] = -25;
        if (pos[i3 + 1] < -25) pos[i3 + 1] = 25;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y += 0.00015;
      grid.rotation.y -= 0.0001;
      grid.rotation.x += 0.00005;

      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      camera.aspect = container!.clientWidth / container!.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container!.clientWidth, container!.clientHeight);
    };
    window.addEventListener("resize", onResize);

    onCleanup(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      gridGeo.dispose();
      material.dispose();
      gridMat.dispose();
      renderer.dispose();
      container?.removeChild(renderer.domElement);
    });
  });

  return <div ref={container} style="position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.5" />;
}
