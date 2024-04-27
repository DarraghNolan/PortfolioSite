import React, { useRef, useEffect, startTransition } from 'react';
import { Canvas, useLoader } from 'react-three-fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDScene = ({ model, albedo, opacity, rotX, rotY, rotZ, posX, posY, posZ, scale, animSpeed }) => {
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

            // Apply opacity texture
            child.material.alphaMap = opacityTexture;
            child.material.transparent = true;
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
          mixer.update(animSpeed);
          requestAnimationFrame(animate);
        };

        animate();

        fbxRef.current = fbxModel;
      });
    };

    loadModel();
  }, [fbxModel, albedoTexture, opacityTexture]);

  return (
    <Canvas
      camera={{ fov: 60, position: [0, 0, 10], near: 0.1, far: 3250 }}
      onCreated={({ camera, gl }) => {
        // Adjust camera settings here if needed
        const controls = new OrbitControls(camera, gl.domElement);
        // Configure controls if necessary
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.25; // friction/smoothness - higher value makes it slower
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2; // don't go below the ground
    
        // Set the controls target to the position of your single model
        if (fbxRef.current) {
          controls.target.copy(fbxRef.current.position);
        }
      }}
    >

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.3} />
      
      {/* Replace <primitive> with primitive */}
      {fbxModel && (
        <primitive
          object={fbxModel}
          ref={fbxRef}

          rotation={[rotX, rotY, rotZ]}
          position={[posX, posY, posZ]}
          scale={[scale, scale, scale]}

          // rotation={[-Math.PI / 2, -Math.PI / 25, 0]}
          // position={[0, 275, -650]}
        />
      )}
    </Canvas>
  );
};

export default ThreeDScene;