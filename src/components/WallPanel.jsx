import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Three-tier wall panel:
// Tier 1 — image texture, always visible
// Tier 2 — title + caption, shown when crosshair is on panel
// Tier 3 — description, video, links, shown in modal on click
function WallPanel({
  position = [0, 1.5, 0],
  rotation = [0, 0, 0],
  scale = [2, 1.5],
  image = null,
  title = 'Panel Title',
  caption = 'Caption text',
  description = '',
  videoUrl = '',
  links = [],
  modalOpen = false,
  onPanelClick = () => {}
}) {
  const meshRef = useRef();
  const titleRef = useRef();
  const captionRef = useRef();
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const centerScreen = new THREE.Vector2(0, 0);

  const width = Math.max(0.1, Number(scale?.[0] ?? 2));
  const height = Math.max(0.1, Number(scale?.[1] ?? 1.5));
  const titleY = Math.min(height * 0.3, height / 2 - 0.1);
  const captionY = Math.max(0.08, height * 0.08);
  const titleSize = Math.max(0.09, Math.min(0.2, height * 0.12));
  const captionSize = Math.max(0.07, Math.min(0.13, height * 0.08));

  // Tier 1: load image texture onto mesh
  useEffect(() => {
    if (!image) return;
    const loader = new THREE.TextureLoader();
    loader.load(image, (tex) => {
      if (!meshRef.current) return;
      meshRef.current.material.map = tex;
      meshRef.current.material.color.set('#aaaaaa');
      meshRef.current.material.needsUpdate = true;
    });
  }, [image]);

  // Tier 2: brighten on hover, toggle text visibility
  useFrame(() => {
    if (!meshRef.current) return;
    raycaster.current.setFromCamera(centerScreen, camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    meshRef.current.material.color.set(hit ? '#ffffff' : (image ? '#aaaaaa' : '#888888'));
    if (titleRef.current) titleRef.current.visible = hit;
    if (captionRef.current) captionRef.current.visible = hit;
  });

  // Tier 3: open modal on click
  const handleCanvasClick = () => {
    if (modalOpen) return;
    if (document.pointerLockElement !== gl.domElement) return;
    raycaster.current.setFromCamera(centerScreen, camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    if (hit) onPanelClick({ title, caption, description, videoUrl, links });
  };

  useEffect(() => {
    gl.domElement.addEventListener('click', handleCanvasClick);
    return () => gl.domElement.removeEventListener('click', handleCanvasClick);
  }, [gl, onPanelClick, title, caption, description, videoUrl, links, modalOpen]);

  return (
    <group position={position} rotation={rotation}>
      {/* Panel face */}
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#888888" side={THREE.DoubleSide} />
      </mesh>

      {/* Tier 2: title */}
      <Text
        ref={titleRef}
        visible={false}
        position={[0, titleY, 0.01]}
        fontSize={titleSize}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={Math.max(0.3, width * 0.9)}
        outlineWidth={0.012}
        outlineColor="#000000"
        font={undefined}
      >
        {title}
      </Text>

      {/* Tier 2: caption */}
      <Text
        ref={captionRef}
        visible={false}
        position={[0, captionY, 0.01]}
        fontSize={captionSize}
        color="#eeeeee"
        anchorX="center"
        anchorY="middle"
        maxWidth={Math.max(0.3, width * 0.85)}
        lineHeight={1.4}
        outlineWidth={0.008}
        outlineColor="#000000"
        font={undefined}
      >
        {caption}
      </Text>
    </group>
  );
}

export default WallPanel;
