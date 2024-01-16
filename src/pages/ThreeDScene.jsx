import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader, useFrame } from 'react-three-fiber';
import { FBXLoader } from 'three/addons/loaders/FBXLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';

const ThreeDScene = () => {
  const fbxRef = useRef();

  const fbxModel = useLoader(FBXLoader, process.env.PUBLIC_URL + '/mdls/FlyFella.fbx');
  const albedoTexture = useLoader(TextureLoader, process.env.PUBLIC_URL + '/mdls/FlyFellaAlbedo.png');
  // Load other textures similarly

  // Apply textures to the model
  fbxModel.traverse((child) => {
    if (child.isMesh) {
      child.material.map = albedoTexture;
      // Apply other textures
    }
  });

  useFrame(() => {
    // Update animation/frame logic here
  });

  return (
    <Canvas>
      <primitive object={fbxModel} ref={fbxRef} />
      {/* Your 3D scene goes here */}
    </Canvas>
  );
};

export default ThreeDScene;