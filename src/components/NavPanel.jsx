import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// A navigation panel — click it to travel to another room route.
function NavPanel({
  position = [0, 1.5, 0],
  rotation = [0, 0, 0],
  scale = [2, 4, 0.2],
  wireColor = '#22aaff',
  label = 'Next Room \u2192',
  modalOpen = false,
  onNavigate = () => {},
  interactionMode = 'desktop'
}) {
  const meshRef = useRef();
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const centerScreen = useRef(new THREE.Vector2(0, 0));
  const mobileTapStart = useRef(null);

  useFrame(() => {
    if (!meshRef.current) return;
    raycaster.current.setFromCamera(centerScreen.current, camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    meshRef.current.material.color.set(hit ? '#88ccff' : '#2266aa');
  });

  const getPointerNdc = useCallback((clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return centerScreen.current;
    }

    return new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1)
    );
  }, [gl.domElement]);

  const handleCanvasClick = useCallback(() => {
    if (modalOpen) return;
    if (interactionMode !== 'mobile' && document.pointerLockElement !== gl.domElement) return;
    raycaster.current.setFromCamera(centerScreen.current, camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    if (hit) onNavigate();
  }, [camera, gl.domElement, interactionMode, modalOpen, onNavigate]);

  const handleMobilePointerDown = useCallback((event) => {
    if (interactionMode !== 'mobile') return;
    if (event.pointerType !== 'touch') return;

    mobileTapStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }, [interactionMode]);

  const handleMobilePointerUp = useCallback((event) => {
    if (interactionMode !== 'mobile') return;
    if (event.pointerType !== 'touch') return;
    if (!mobileTapStart.current || mobileTapStart.current.pointerId !== event.pointerId) return;
    if (modalOpen) return;

    const deltaX = event.clientX - mobileTapStart.current.x;
    const deltaY = event.clientY - mobileTapStart.current.y;
    const movedDistance = Math.hypot(deltaX, deltaY);
    mobileTapStart.current = null;

    if (movedDistance > 12) return;

    raycaster.current.setFromCamera(getPointerNdc(event.clientX, event.clientY), camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    if (hit) onNavigate();
  }, [camera, getPointerNdc, interactionMode, modalOpen, onNavigate]);

  const handleMobilePointerCancel = useCallback(() => {
    mobileTapStart.current = null;
  }, []);

  useEffect(() => {
    gl.domElement.addEventListener('click', handleCanvasClick);
    gl.domElement.addEventListener('pointerdown', handleMobilePointerDown);
    gl.domElement.addEventListener('pointerup', handleMobilePointerUp);
    gl.domElement.addEventListener('pointercancel', handleMobilePointerCancel);
    return () => {
      gl.domElement.removeEventListener('click', handleCanvasClick);
      gl.domElement.removeEventListener('pointerdown', handleMobilePointerDown);
      gl.domElement.removeEventListener('pointerup', handleMobilePointerUp);
      gl.domElement.removeEventListener('pointercancel', handleMobilePointerCancel);
    };
  }, [gl, handleCanvasClick, handleMobilePointerDown, handleMobilePointerUp, handleMobilePointerCancel]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2266aa" side={THREE.DoubleSide} transparent opacity={0.28} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial color={wireColor} />
      </lineSegments>
      <Text
        position={[0, 0, 0.52]}
        fontSize={0.11}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.9}
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {label}
      </Text>
    </group>
  );
}

export default NavPanel;
