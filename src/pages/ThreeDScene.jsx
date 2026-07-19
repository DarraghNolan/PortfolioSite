import React, { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { AnimationMixer, Clock, Color, TextureLoader } from 'three';
import * as THREE from 'three';

function ThreeDScene({ url, albedo, opacity, metalness, roughness, emissive, rotX, rotY, rotZ, posX, posY, posZ, scale, isAnimating, animSpeed, camPosY }) {

  // console.log('URL:', url); // Add this line to log the URL
  const { scene, animations } = useGLTF(url);
  const mixer = useRef(null);
  const clock = useRef(new Clock());

  useEffect(() => {
    if (isAnimating) {
      mixer.current = new AnimationMixer(scene);
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip);
        action.setEffectiveTimeScale(animSpeed); // Set initial animSpeed
        action.play();
      });

      const animate = () => {
        if (mixer.current) {
          requestAnimationFrame(animate);
          const delta = clock.current.getDelta();
          mixer.current.update(delta);
        }
      };

      animate();
    }

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current = null;
      }
    };
  }, [scene, animations, isAnimating, animSpeed]);

  useEffect(() => {
    if (mixer.current) {
      mixer.current.timeScale = animSpeed;
    }
  }, [animSpeed]);


  useEffect(() => {
    const textureLoader = new TextureLoader();
    const ALBTexture = textureLoader.load(albedo); // Adjust path to your texture
    const OPYTexture = textureLoader.load(opacity); // Adjust path to your texture
    const MTCTexture = textureLoader.load(metalness); // Adjust path to your texture
    const RNSTexture = textureLoader.load(roughness); // Adjust path to your texture
    const ESETexture = textureLoader.load(emissive); // Adjust path to your texture

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map = ALBTexture;
        child.material.alphaMap = OPYTexture; 
        child.material.transparent = true;
        // child.material.roughness = 0.5; // Adjust roughness to reduce overly reflective appearance
        // child.material.metalnessMap = MTCTexture;
        child.material.emissiveMap = ESETexture;
        child.material.emissive = new THREE.Color(0x00fff7);
        child.material.emissiveIntensity = 1.5;
        // child.material.roughnessMap = RNSTexture;       
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  return (
    <Canvas camera={{fov: 30, near:0.5, far:9999}}>
      <ambientLight intensity={4} />
      <directionalLight position={[0,camPosY,-100]} rotation={[0,0,0]} intensity={1.5} />
      <directionalLight position={[0,camPosY,100]} rotation={[0,0,0]} intensity={3} />
      <pointLight position={[posX+200, camPosY-50, posZ-100]} intensity={9} color={'#f403fc'}/>
      <Suspense fallback={null}>
        <primitive 
          object={scene} 
          rotation={[rotX, rotY, rotZ]}
          position={[posX, posY, posZ]}
          scale={[scale, scale, scale]}
        />
        <OrbitControls target={[posX, camPosY, posZ]}/>
      </Suspense>
    </Canvas>
  );
}

export default ThreeDScene;
