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
  onNavigate = () => {}
}) {
  const meshRef = useRef();
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const centerScreen = useRef(new THREE.Vector2(0, 0));

  useFrame(() => {
    if (!meshRef.current) return;
    raycaster.current.setFromCamera(centerScreen.current, camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    meshRef.current.material.color.set(hit ? '#88ccff' : '#2266aa');
  });

  const handleCanvasClick = useCallback(() => {
    if (modalOpen) return;
    if (document.pointerLockElement !== gl.domElement) return;
    raycaster.current.setFromCamera(centerScreen.current, camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    if (hit) onNavigate();
  }, [camera, gl.domElement, modalOpen, onNavigate]);

  useEffect(() => {
    gl.domElement.addEventListener('click', handleCanvasClick);
    return () => gl.domElement.removeEventListener('click', handleCanvasClick);
  }, [gl, handleCanvasClick]);

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
