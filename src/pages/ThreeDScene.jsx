import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader, useFrame } from 'react-three-fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';  // Correct import statement
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDScene = () => {
  const models = [
    { fbxPath: '../mdls/FlyFella.fbx', texturePath: '../mdls/FlyFellaAlbedo.png', position: [0, 275, -550] },
    { fbxPath: '../mdls/YourNextModel.fbx', texturePath: '../mdls/YourNextModelAlbedo.png', position: [200, 275, -550] },
    // Add more models as needed
  ];



  const fbxRef = useRef();
  const controlsRef = useRef();

  const fbxModel = useLoader(FBXLoader, '../mdls/FlyFella.fbx');
  const albedoTexture = useLoader(TextureLoader, '../mdls/FlyFellaAlbedo.png');

  useEffect(() => {
    const loadModel = async () => {
      // Apply textures to the model
      fbxModel.traverse((child) => {
        if (child.isMesh) {
          child.material.map = albedoTexture;
          // Apply other textures
        }
      });

      // Access animations
      const animations = fbxModel.animations;
      animations.forEach((clip) => {
        // Enable looping for each animation
        clip.loop = THREE.LoopRepeat;
        clip.clampWhenFinished = true; // This ensures that the animation doesn't automatically transition to the default pose
      });

      // Play the first animation
      const mixer = new THREE.AnimationMixer(fbxModel);
      const action = mixer.clipAction(animations[0]);
      action.play();

      // Update the mixer in the animation loop
      const animate = () => {
        mixer.update(0.0175); // You can adjust the time delta here
        requestAnimationFrame(animate);
      };

      animate();

      // Set the model to the ref
      fbxRef.current = fbxModel;
    };

    loadModel();
  }, []); // Empty dependency array to run the effect only once

  return (
    <Canvas>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.3}  />

      {/* Model */}
      <primitive object={fbxModel} ref={fbxRef}
       rotation={[-Math.PI / 2, -Math.PI / 25, -Math.PI / 5]} 
      position={[0, 275, -550]}
      />
    </Canvas>
  );
};

export default ThreeDScene;