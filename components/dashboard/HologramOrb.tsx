'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SectorSummary } from '@/types/portfolio';
import { RotateCcw, Box, Hand } from 'lucide-react';

interface HologramOrbProps {
  sectors: SectorSummary[];
}

export const HologramOrb: React.FC<HologramOrbProps> = ({ sectors }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const orbGroupRef = useRef<THREE.Group | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Quick lookup for sector weights
  const getSectorWeight = (name: string): number => {
    const s = sectors.find(sec => sec.sector.toLowerCase().includes(name.toLowerCase()));
    return s ? s.portfolioWeightPercent : 0;
  };

  const financialWeight = getSectorWeight('Financial') || 21.3;
  const techWeight = getSectorWeight('Tech') || 21.9;
  const consumerWeight = getSectorWeight('Consumer') || 17.1;
  const powerWeight = getSectorWeight('Power') || 10.3;
  const pipeWeight = getSectorWeight('Pipe') || 12.9;
  const othersWeight = getSectorWeight('Other') || 16.5;

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth || 400;
    const height = currentMount.clientHeight || 250;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.3);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    currentMount.appendChild(renderer.domElement);

    // Group for orbital geometry
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);
    orbGroupRef.current = orbGroup;

    // 1. Inner Glowing Wireframe Core
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 3);
    const coreMat = new THREE.MeshLambertMaterial({
      color: 0x7C5CFC,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    orbGroup.add(coreMesh);

    // 2. Dynamic Sector Rings scaled by sector weights
    function createRing(radius: number, tube: number, color: number, rotX: number, rotY: number) {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.82,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = rotX;
      ring.rotation.y = rotY;
      return ring;
    }

    // Scaled radii based on sector weights
    const ring1 = createRing(1.35 + (techWeight / 100) * 0.4, 0.022, 0x00E676, Math.PI / 3, Math.PI / 6); // Green (Tech/Gains)
    const ring2 = createRing(1.55 + (financialWeight / 100) * 0.4, 0.024, 0x7C5CFC, -Math.PI / 4, Math.PI / 4); // Violet (Finance)
    const ring3 = createRing(1.75 + (consumerWeight / 100) * 0.3, 0.020, 0x5B8DEF, Math.PI / 2.2, -Math.PI / 5); // Cobalt (Consumer)
    const ring4 = createRing(1.20 + (powerWeight / 100) * 0.3, 0.018, 0xFF4757, -Math.PI / 3, -Math.PI / 3); // Coral (Power)
    const ring5 = createRing(1.95 + (pipeWeight / 100) * 0.25, 0.016, 0xE6DEFF, Math.PI / 5, -Math.PI / 2.5); // Lilac (Pipe)

    orbGroup.add(ring1);
    orbGroup.add(ring2);
    orbGroup.add(ring3);
    orbGroup.add(ring4);
    orbGroup.add(ring5);

    // 3. Constellation Particle Cloud
    const partCount = 200;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(partCount * 3);
    const colors = new Float32Array(partCount * 3);
    const palette = [
      new THREE.Color(0x00E676),
      new THREE.Color(0x7C5CFC),
      new THREE.Color(0x5B8DEF),
      new THREE.Color(0xFFFFFF),
      new THREE.Color(0xCABEFF),
    ];

    for (let i = 0; i < partCount; i++) {
      const r = 1.25 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const partMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
    });
    const particleSystem = new THREE.Points(partGeo, partMat);
    orbGroup.add(particleSystem);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x7C5CFC, 2.5, 50);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00E676, 2.0, 50);
    pointLight2.position.set(-4, -3, 2);
    scene.add(pointLight2);

    // 5. Interaction variables (Mouse, Touch & Drag)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;

    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = currentMount.getBoundingClientRect();
      mouseX = ((clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((clientY - rect.top) / rect.height - 0.5) * 2;

      if (isDragging) {
        const deltaX = clientX - previousX;
        const deltaY = clientY - previousY;
        orbGroup.rotation.y += deltaX * 0.01;
        orbGroup.rotation.x += deltaY * 0.01;
        previousX = clientX;
        previousY = clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsInteracting(true);
      previousX = e.clientX;
      previousY = e.clientY;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        setIsInteracting(true);
        previousX = e.touches[0].clientX;
        previousY = e.touches[0].clientY;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    currentMount.addEventListener('mousemove', handleMouseMove);
    currentMount.addEventListener('mousedown', handleMouseDown);
    currentMount.addEventListener('touchmove', handleTouchMove, { passive: true });
    currentMount.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    // Responsive ResizeObserver for crisp viewport resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(currentMount);

    // 6. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        orbGroup.rotation.y += 0.007;
        orbGroup.rotation.x += 0.002;
        ring1.rotation.z += 0.010;
        ring2.rotation.z -= 0.008;
        ring3.rotation.z += 0.012;
        ring4.rotation.x += 0.009;
        ring5.rotation.y += 0.007;

        orbGroup.rotation.x = targetY * 0.45;
        orbGroup.rotation.y += targetX * 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      currentMount.removeEventListener('mousemove', handleMouseMove);
      currentMount.removeEventListener('mousedown', handleMouseDown);
      currentMount.removeEventListener('touchmove', handleTouchMove);
      currentMount.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);

      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }

      scene.clear();
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      partGeo.dispose();
      partMat.dispose();
    };
  }, [financialWeight, techWeight, consumerWeight, powerWeight, pipeWeight, othersWeight]);

  const handleReset = () => {
    if (orbGroupRef.current) {
      orbGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="lg:col-span-7 rounded-xl bg-[#10141F] p-4 sm:p-6 border border-white/[0.08] shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-[#7C5CFC]" />
            <h2 className="font-heading text-base sm:text-lg text-white font-semibold">
              3D Portfolio Hologram
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Drag and inspect dynamic orbital asset weights
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-0.5 rounded-full bg-[#151B2B] font-numeric text-xs text-[#CABEFF] border border-white/[0.08]">
            Orbital v2.4
          </span>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-[#151B2B] hover:bg-[#1D2026] text-[#94A3B8] hover:text-white transition-colors border border-white/[0.08]"
            title="Reset Hologram View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hologram Canvas Viewport */}
      <div 
        ref={mountRef} 
        className={`relative w-full h-56 sm:h-64 my-3 flex items-center justify-center overflow-hidden rounded-lg bg-[#0B0E14]/70 backdrop-blur-md cursor-grab active:cursor-grabbing border border-white/[0.06] touch-none ${
          isInteracting ? 'ring-1 ring-[#7C5CFC]/50' : ''
        }`}
      >
        <div className="absolute bottom-2 left-3 pointer-events-none flex items-center gap-1.5 font-heading text-[9px] sm:text-[10px] text-[#94A3B8]/80 uppercase tracking-wider">
          <Hand className="w-3 h-3" />
          <span>INTERACTIVE SCENE ENABLED • TOUCH / DRAG TO ROTATE</span>
        </div>
      </div>

      {/* Dynamic Sector Weight Badges */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 pt-1 z-10 font-numeric text-xs">
        <div className="flex flex-col bg-[#151B2B] p-2 rounded-lg border border-white/[0.06]">
          <span className="text-[#94A3B8] text-[10px] sm:text-[11px] truncate">Financial</span>
          <span className="text-white font-semibold">{financialWeight.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col bg-[#151B2B] p-2 rounded-lg border border-white/[0.06]">
          <span className="text-[#94A3B8] text-[10px] sm:text-[11px] truncate">Tech</span>
          <span className="text-[#7C5CFC] font-semibold">{techWeight.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col bg-[#151B2B] p-2 rounded-lg border border-white/[0.06]">
          <span className="text-[#94A3B8] text-[10px] sm:text-[11px] truncate">Consumer</span>
          <span className="text-[#00E676] font-semibold">{consumerWeight.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col bg-[#151B2B] p-2 rounded-lg border border-white/[0.06]">
          <span className="text-[#94A3B8] text-[10px] sm:text-[11px] truncate">Power</span>
          <span className="text-[#FFB3B2] font-semibold">{powerWeight.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col bg-[#151B2B] p-2 rounded-lg border border-white/[0.06]">
          <span className="text-[#94A3B8] text-[10px] sm:text-[11px] truncate">Pipe</span>
          <span className="text-[#E6DEFF] font-semibold">{pipeWeight.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col bg-[#151B2B] p-2 rounded-lg border border-white/[0.06]">
          <span className="text-[#94A3B8] text-[10px] sm:text-[11px] truncate">Others</span>
          <span className="text-[#94A3B8] font-semibold">{othersWeight.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
