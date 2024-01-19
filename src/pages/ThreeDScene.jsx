import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader, useFrame } from 'react-three-fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';  
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import * as THREE from 'three';

const ThreeDScene = ({ model, albedo, rotX, rotY, rotZ, posX, posY, posZ }) => {
  const fbxRef = useRef();

  const fbxModel = useLoader(FBXLoader, model);
  const albedoTexture = useLoader(TextureLoader, albedo);

  useEffect(() => {
    const loadModel = async () => {
      console.log('Loading albedo texture:', albedo);
      fbxModel.traverse((child) => {
        if (child.isMesh) {
          child.material.map = albedoTexture;
        }
      });

      const animations = fbxModel.animations;
      animations.forEach((clip) => {
        clip.loop = THREE.LoopRepeat;
        clip.clampWhenFinished = true;
      });

      const mixer = new THREE.AnimationMixer(fbxModel);
      const action = mixer.clipAction(animations[0]);
      action.play();

      const animate = () => {
        fbxModel.rotation.z -= 0.005;
        mixer.update(0.0175);
        requestAnimationFrame(animate);
      };

      animate();

      fbxRef.current = fbxModel;
    };

    loadModel();
  }, [fbxModel, albedoTexture]);

  return (
    <Canvas>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.3} />
      
      {/* Replace <primitive> with primitive */}
      {fbxModel && (
        <primitive
          object={fbxModel}
          ref={fbxRef}

          rotation={[rotX, rotY, rotZ]}
          position={[posX, posY, posZ]}

          // rotation={[-Math.PI / 2, -Math.PI / 25, 0]}
          // position={[0, 275, -650]}
        />
      )}
    </Canvas>
  );
};

export default ThreeDScene;