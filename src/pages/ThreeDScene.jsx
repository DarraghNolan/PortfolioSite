import React, { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { AnimationMixer, Clock, TextureLoader } from 'three';

function ThreeDScene({ url, albedo, opacity, rotX, rotY, rotZ, posX, posY, posZ, scale, isAnimating, animSpeed, camPosY }) {

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

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map = ALBTexture;
        child.material.alphaMap = OPYTexture;
        child.material.transparent = true;
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  return (
    <Canvas camera={{fov: 30, near:0.5, far:9999}}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 50, 50]} intensity={4} />
      <directionalLight position={[-50, -50, -50]} intensity={3} />
      <pointLight position={[-5, -5, -5]} intensity={9} />
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
