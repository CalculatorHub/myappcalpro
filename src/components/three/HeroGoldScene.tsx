import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GoldCrestMark } from '../ui/GoldCrestMark';

const _dummy = new THREE.Object3D();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createOctagonRingGeometry(): THREE.ExtrudeGeometry {
  const outerR = 1.48;
  const innerR = 1.18;
  const sides = 8;

  const shape = new THREE.Shape();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(angle) * outerR;
    const y = Math.sin(angle) * outerR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const hole = new THREE.Path();
  for (let i = sides - 1; i >= 0; i--) {
    const angle = (i / sides) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(angle) * innerR;
    const y = Math.sin(angle) * innerR;
    if (i === sides - 1) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  hole.closePath();
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

function createBeveledBarGeometry(width: number, height: number, depth: number): THREE.ExtrudeGeometry {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(hh, 0.045);

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.032,
    bevelSize: 0.024,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geo.center();
  return geo;
}

function createRupeeBarsAndStem(): THREE.Group {
  const group = new THREE.Group();

  // Beveled extruded horizontal Rupee strokes matching the sculptural stem
  const topBarGeo = createBeveledBarGeometry(0.92, 0.125, 0.16);
  const midBarGeo = createBeveledBarGeometry(0.92, 0.125, 0.16);

  const topBar = new THREE.Mesh(topBarGeo);
  topBar.position.set(0.02, 0.56, 0.12);

  const midBar = new THREE.Mesh(midBarGeo);
  midBar.position.set(0.02, 0.24, 0.12);

  // Curved shoulder arc + diagonal foot built via beveled ExtrudeGeometry
  const curveShape = new THREE.Shape();
  curveShape.moveTo(-0.08, 0.56);
  curveShape.bezierCurveTo(0.45, 0.56, 0.45, -0.05, -0.1, -0.05);
  curveShape.lineTo(-0.34, -0.05);
  curveShape.lineTo(0.28, -0.66);
  curveShape.lineTo(0.11, -0.74);
  curveShape.lineTo(-0.46, -0.15);
  curveShape.lineTo(-0.46, 0.04);
  curveShape.lineTo(-0.1, 0.04);
  curveShape.bezierCurveTo(0.25, 0.04, 0.25, 0.43, -0.08, 0.43);
  curveShape.closePath();

  const curveGeo = new THREE.ExtrudeGeometry(curveShape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.025,
    bevelSegments: 3,
    curveSegments: 24,
  });
  curveGeo.translate(0, 0, 0.03);

  const curveMesh = new THREE.Mesh(curveGeo);

  group.add(topBar, midBar, curveMesh);
  group.position.set(0.02, 0.06, 0);
  return group;
}

export const HeroGoldScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileViewport = window.innerWidth < 768;
    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 420, container.clientHeight || 380);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(canvas);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.04);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 380;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 40);
    camera.position.set(0, 0.1, 6.2);

    // 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfef3c7, 0x111115, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1c2, 2.2);
    keyLight.position.set(4.5, 5.5, 5.2);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xd4af37, 3.2, 16, 1.5);
    rimLight.position.set(-4.2, -1.5, 3.6);
    scene.add(rimLight);

    // Materials with calibrated metalness & roughness variance
    const brushedGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.96,
      roughness: 0.2,
      anisotropy: 0.85,
      clearcoat: 0.45,
      clearcoatRoughness: 0.18,
    });

    const champagneGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5d76e,
      metalness: 1.0,
      roughness: 0.12,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
      emissive: 0x3b2a04,
      emissiveIntensity: 0.35,
    });

    const obsidianInlayMat = new THREE.MeshStandardMaterial({
      color: 0x0b0b0d,
      metalness: 0.35,
      roughness: 0.56,
    });

    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.94,
      roughness: 0.26,
      transparent: true,
      opacity: 0.85,
    });

    // Composite Procedural 5-Part Emblem Group
    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    // Part 1: Beveled Octagonal Gold Bezel
    const bezelGeo = createOctagonRingGeometry();
    const bezelMesh = new THREE.Mesh(bezelGeo, brushedGoldMat);
    emblemGroup.add(bezelMesh);

    // Part 2: Obsidian Vault Backplate Disc (offset slightly behind strokes to avoid Z-fighting)
    const backplateGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.14, 32);
    backplateGeo.rotateX(Math.PI / 2);
    const backplateMesh = new THREE.Mesh(backplateGeo, obsidianInlayMat);
    backplateMesh.position.z = -0.02;
    emblemGroup.add(backplateMesh);

    // Part 3: Sculpted Champagne-Gold Rupee Emblem
    const rupeeGroup = createRupeeBarsAndStem();
    rupeeGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = champagneGoldMat;
      }
    });
    emblemGroup.add(rupeeGroup);

    // Part 4: Dual Gyroscopic Orbital Gold Rings
    const outerOrbitGeo = new THREE.TorusGeometry(1.92, 0.026, 16, 84);
    const outerOrbitMesh = new THREE.Mesh(outerOrbitGeo, ringMat);
    outerOrbitMesh.rotation.set(0.65, 0.25, 0);
    emblemGroup.add(outerOrbitMesh);

    const innerOrbitGeo = new THREE.TorusGeometry(1.72, 0.018, 12, 72);
    const innerOrbitMesh = new THREE.Mesh(innerOrbitGeo, champagneGoldMat);
    innerOrbitMesh.rotation.set(-0.55, 0.45, 0.2);
    emblemGroup.add(innerOrbitMesh);

    // Part 5: Instanced Gold Dust Particles (scaled down on mobile)
    const particleCount = isMobileViewport ? 28 : 68;
    const particleGeo = new THREE.OctahedronGeometry(0.032, 0);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xf5d76e,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd4af37,
      emissiveIntensity: 0.45,
    });
    const particlesMesh = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    particlesMesh.frustumCulled = false;

    const seeds = Array.from({ length: particleCount }, () => ({
      radius: 2.1 + Math.random() * 1.85,
      angle: Math.random() * Math.PI * 2,
      speed: (0.14 + Math.random() * 0.24) * (Math.random() > 0.5 ? 1 : -1),
      yBase: (Math.random() - 0.5) * 2.8,
      zOffset: (Math.random() - 0.5) * 1.6,
      scale: 0.55 + Math.random() * 0.9,
    }));

    for (let i = 0; i < particleCount; i++) {
      const s = seeds[i];
      _dummy.position.set(Math.cos(s.angle) * s.radius, s.yBase, s.zOffset);
      _dummy.scale.setScalar(s.scale);
      _dummy.updateMatrix();
      particlesMesh.setMatrixAt(i, _dummy.matrix);
    }
    particlesMesh.instanceMatrix.needsUpdate = true;
    particlesMesh.computeBoundingSphere();
    scene.add(particlesMesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer tracking (normalized -1..1)
    let pointerX = 0;
    let pointerY = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 420;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let elapsedSpin = 0;

    function renderFrame(delta: number, totalElapsed: number) {
      if (prefersReducedMotion) {
        emblemGroup.rotation.y = 0.24;
        emblemGroup.rotation.x = -0.08;
        renderer.render(scene, camera);
        return;
      }

      elapsedSpin += delta * 0.42;
      const targetRotY = elapsedSpin + pointerX * 0.48;
      const targetRotX = -pointerY * 0.34 + Math.sin(totalElapsed * 0.8) * 0.08;

      emblemGroup.rotation.y = THREE.MathUtils.damp(emblemGroup.rotation.y, targetRotY, 4.5, delta);
      emblemGroup.rotation.x = THREE.MathUtils.damp(emblemGroup.rotation.x, targetRotX, 4.5, delta);
      emblemGroup.position.y = Math.sin(totalElapsed * 1.35) * 0.1;

      outerOrbitMesh.rotation.z += delta * 0.25;
      outerOrbitMesh.rotation.x = 0.65 + Math.sin(totalElapsed * 0.6) * 0.14;
      innerOrbitMesh.rotation.y -= delta * 0.34;

      for (let i = 0; i < particleCount; i++) {
        const s = seeds[i];
        const ang = s.angle + totalElapsed * s.speed;
        _dummy.position.set(
          Math.cos(ang) * s.radius,
          s.yBase + Math.sin(totalElapsed * 0.9 + i) * 0.18,
          Math.sin(ang) * 0.85 + s.zOffset
        );
        _dummy.rotation.set(totalElapsed * 0.8 + i, totalElapsed * 0.5, 0);
        _dummy.scale.setScalar(s.scale);
        _dummy.updateMatrix();
        particlesMesh.setMatrixAt(i, _dummy.matrix);
      }
      particlesMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    }

    if (prefersReducedMotion) {
      renderFrame(0.016, 0);
    } else {
      const tick = () => {
        if (disposed) return;
        const delta = Math.min(clock.getDelta(), 0.05);
        const totalElapsed = clock.getElapsedTime();
        renderFrame(delta, totalElapsed);
        if (isSoftwareGl) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);

      bezelGeo.dispose();
      backplateGeo.dispose();
      outerOrbitGeo.dispose();
      innerOrbitGeo.dispose();
      particleGeo.dispose();
      rupeeGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });

      brushedGoldMat.dispose();
      champagneGoldMat.dispose();
      obsidianInlayMat.dispose();
      ringMat.dispose();
      particleMat.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="flex h-full min-h-[260px] w-full items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0D]/90">
        <GoldCrestMark size={120} />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="h-[260px] sm:h-[310px] lg:h-[340px] w-full select-none"
      role="img"
      aria-label="Interactive 3D metallic gold FinCalc Pro Rupee crest rotating in dark studio lighting"
    />
  );
};

export default HeroGoldScene;
