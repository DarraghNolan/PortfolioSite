import React, { useRef, useEffect, startTransition } from 'react';
import { Canvas, useLoader } from 'react-three-fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { useGLTF, Stage, PresentationControls } from '@react-three/drei';

function Model(props){
  const {scene} = useGLTF("/mdls/KSGun.glb");
  return <primitive object={scene} {...props} />
}

function GLTF3DScene(){
  return (
    <Canvas camera={{ fov: 60, position: [100, 100, 100], near: 0.1, far: 3250 }}>
      <color attach="background" args={["#101010"]} />
      <PresentationControls speed={1.5} global zoom={9.5} polar={[-0.1, Math.PI /4]}>
        <Stage environment={null}>
          <Model scale={1} />
        </Stage>
      </PresentationControls>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.3} />
    </Canvas>
  );
};

export default GLTF3DScene;