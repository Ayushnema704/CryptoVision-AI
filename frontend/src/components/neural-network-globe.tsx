"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

export function NeuralNetworkGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    camera.position.z = 2.5;

    // Colors based on theme
    const primaryColor = resolvedTheme === 'dark' ? 0x60A5FA : 0x1E3A8A;
    const accentColor = resolvedTheme === 'dark' ? 0x00FFFF : 0x00A0A0;

    // Globe
    const geometry = new THREE.SphereGeometry(1.2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: resolvedTheme === 'dark' ? 0.3 : 0.1,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Particles
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 5;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: accentColor,
      size: 0.01,
      transparent: true,
      opacity: resolvedTheme === 'dark' ? 0.9 : 0.7,
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, resolvedTheme === 'dark' ? 0.5 : 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(accentColor, resolvedTheme === 'dark' ? 3 : 2, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    currentMount.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      sphere.rotation.y += 0.0005;
      sphere.rotation.x += 0.0005;
      particleSystem.rotation.y += 0.0002;
      
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('mousemove', onMouseMove);
      if (renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [isMounted, resolvedTheme]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}
