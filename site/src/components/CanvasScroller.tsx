import { onMount, onCleanup } from "solid-js";
import * as THREE from "three";
import { scrollRatio } from "./SmoothScroll";

const VERTEX = `
  varying float vAlpha;
  varying vec3 vColor;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  uniform float uScroll;
  uniform float uTime;
  void main() {
    vec3 pos = position;
    float wave = sin(uTime * aSpeed * 0.4 + aPhase + pos.z * 0.2) * 0.4;
    pos.x += wave * 0.4;
    float scrollFlow = uScroll * aSpeed * 1.5;
    pos.y += scrollFlow;
    if (pos.y > 35.0) pos.y -= 70.0;
    if (pos.y < -35.0) pos.y += 70.0;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float depth = -mvPosition.z;
    gl_PointSize = (200.0 / depth) * aSize * (1.0 + 0.5 * sin(pos.x * 0.4 + uTime));
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = smoothstep(45.0, 8.0, depth) * (0.35 + uScroll * 0.25);
    vColor = mix(vec3(0.15), vec3(0.93, 0.37, 0.08), smoothstep(38.0, 10.0, depth) * (0.2 + uScroll * 0.4));
  }
`;

const FRAGMENT = `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = smoothstep(1.0, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function CanvasScroller() {
    let container: HTMLDivElement | undefined;

    onMount(() => {
        if (!container || typeof window === "undefined") return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            100,
        );
        camera.position.z = 38;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        renderer.domElement.style.pointerEvents = "none";

        // Layer 1: floating particles
        const count = 350;
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const speeds = new Float32Array(count);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 90;
            positions[i3 + 1] = (Math.random() - 0.5) * 70;
            positions[i3 + 2] = (Math.random() - 0.5) * 45;
            phases[i] = Math.random() * Math.PI * 2;
            speeds[i] = 0.2 + Math.random() * 1.5;
            sizes[i] = 0.4 + Math.random() * 1.4;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3),
        );
        geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
        geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
            uniforms: { uScroll: { value: 0 }, uTime: { value: 0 } },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Layer 2: distant grid
        const gridGeo = new THREE.BufferGeometry();
        const gridPos = new Float32Array(600 * 3);
        for (let i = 0; i < 600; i++) {
            gridPos[i * 3] = (Math.random() - 0.5) * 140;
            gridPos[i * 3 + 1] = (Math.random() - 0.5) * 90;
            gridPos[i * 3 + 2] = -18 - Math.random() * 30;
        }
        gridGeo.setAttribute("position", new THREE.BufferAttribute(gridPos, 3));
        const gridMat = new THREE.PointsMaterial({
            color: 0x2a2924,
            size: 0.06,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const grid = new THREE.Points(gridGeo, gridMat);
        scene.add(grid);

        // Layer 3: accent dots scattered
        const accGeo = new THREE.BufferGeometry();
        const accPos = new Float32Array(30 * 3);
        for (let i = 0; i < 30; i++) {
            accPos[i * 3] = (Math.random() - 0.5) * 60;
            accPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
            accPos[i * 3 + 2] = (Math.random() - 0.5) * 25;
        }
        accGeo.setAttribute("position", new THREE.BufferAttribute(accPos, 3));
        const accMat = new THREE.PointsMaterial({
            color: 0xee5e14,
            size: 0.12,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const accents = new THREE.Points(accGeo, accMat);
        scene.add(accents);

        let frame: number;
        const timer = new THREE.Timer();
        let prevScroll = 0;

        function animate() {
            frame = requestAnimationFrame(animate);
            const dt = Math.min(timer.getDelta(), 0.1);
            const t = performance.now() * 0.001;

            const target = scrollRatio;
            prevScroll += (target - prevScroll) * dt * 3;

            material.uniforms.uScroll.value = prevScroll;
            material.uniforms.uTime.value = t;

            points.rotation.y += dt * 0.06 * (1 - prevScroll * 0.4);
            grid.rotation.y -= dt * 0.025;
            grid.rotation.x += dt * 0.015;
            accents.rotation.y += dt * 0.1;
            accents.rotation.z += dt * 0.05;

            // Fade accent dots based on scroll
            accMat.opacity = 0.2 + prevScroll * 0.4;

            renderer.render(scene, camera);
        }
        animate();

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);

        onCleanup(() => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", onResize);
            geometry.dispose();
            gridGeo.dispose();
            accGeo.dispose();
            material.dispose();
            gridMat.dispose();
            accMat.dispose();
            renderer.dispose();
            if (container) container.innerHTML = "";
        });
    });

    return (
        <div
            ref={container}
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                "pointer-events": "none",
                "z-index": 0,
                opacity: 0.55,
            }}
        />
    );
}
