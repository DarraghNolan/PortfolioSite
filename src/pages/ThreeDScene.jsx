import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TextureLoader } from 'three';
import { startTransition } from 'react';

const ThreeDScene = ({ model, albedo, opacity, rotX, rotY, rotZ, posX, posY, posZ, scale, animSpeed, isAnimated }) => {
  const fbxRef = useRef();
  const fbxModel = useLoader(FBXLoader, model);
  const albedoTexture = useLoader(TextureLoader, albedo);
  const opacityTexture = useLoader(TextureLoader, opacity);

  useEffect(() => {
    const loadModel = async () => {
      startTransition(() => {
        console.log('Loading albedo texture:', albedo);
        fbxModel.traverse((child) => {
          if (child.isMesh) {
            child.material.map = albedoTexture;
            child.material.alphaMap = opacityTexture;
            child.material.transparent = true;
          }
        });

        if (isAnimated) {
          const animations = fbxModel.animations;
          if (animations && animations.length > 0) {
            animations.forEach((clip) => {
              clip.loop = THREE.LoopRepeat;
              clip.clampWhenFinished = true;
            });

            const mixer = new THREE.AnimationMixer(fbxModel);
            const action = mixer.clipAction(animations[0]);
            action.play();

            const animate = () => {
              mixer.update(animSpeed);
              requestAnimationFrame(animate);
            };

            animate();
          }
        }

        fbxRef.current = fbxModel;
      });
    };

    loadModel();
  }, [fbxModel, albedoTexture, opacityTexture, isAnimated, animSpeed]);

  return (
    <Canvas
      camera={{ fov: 60, position: [0, 0, 10], near: 0.1, far: 3250 }}
      onCreated={({ camera, gl }) => {
        const controls = new OrbitControls(camera, gl.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;
        if (fbxRef.current) {
          controls.target.copy(fbxRef.current.position);
        }
      }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.3} />

      {fbxModel && (
        <primitive
          object={fbxModel}
          ref={fbxRef}
          rotation={[rotX, rotY, rotZ]}
          position={[posX, posY, posZ]}
          scale={[scale, scale, scale]}
        />
      )}
    </Canvas>
  );
};

export default ThreeDScene;
