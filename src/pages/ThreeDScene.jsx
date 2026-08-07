import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { AnimationMixer, Clock, Euler, MathUtils, TextureLoader, Vector3 } from 'three';
import FPSControls from '../components/FPSControls';
import WallPanel from '../components/WallPanel';
import NavPanel from '../components/NavPanel';

const ROOM_LIGHT_INTENSITY_MULTIPLIER = 40;

function RoomSpotLight({ light }) {
  const lightRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    if (!lightRef.current || !targetRef.current) return;

    const [px, py, pz] = light.position;
    const [rx, ry, rz] = light.rotation;

    const direction = new Vector3(0, 0, -1)
      .applyEuler(new Euler(rx, ry, rz, 'XYZ'))
      .normalize();
    const targetPosition = new Vector3(px, py, pz).add(direction.multiplyScalar(5));

    targetRef.current.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
    lightRef.current.target = targetRef.current;
  }, [light]);

  return (
    <>
      <object3D ref={targetRef} />
      <spotLight
        ref={lightRef}
        position={light.position}
        angle={MathUtils.degToRad(light.angleDeg)}
        intensity={light.intensity * ROOM_LIGHT_INTENSITY_MULTIPLIER}
        color={light.color}
        penumbra={0.2}
        distance={0}
        castShadow={light.castShadow}
      />
    </>
  );
}

function ThreeDScene({ 
  // Existing props for model viewer mode
  url, albedo, opacity, metalness, roughness, emissive, 
  rotX, rotY, rotZ, posX, posY, posZ, scale, 
  isAnimating, animSpeed, camPosY,
  roomTexture = '',
  
  // New props for FPS room mode
  mode = "viewer", // "viewer" or "fps"
  railMin = -10,   // minimum Z camera position on the rail
  railMax = 10,    // maximum Z camera position on the rail
  railPoints = null,
  railStartPos = 0,
  railPosition = 0,
  onRailPositionChange = () => {},
  interactionMode = 'desktop',
  mobileLookSensitivity = 0.006,
  scrollSpeed = 0.0001,
  lookSpeed = 0.002,
  eyeHeight = 1.67,
  defaultLightEnabled = true,
  shadowsEnabled = false,
  
  // Modal props
  modalOpen = false,
  onPanelClick = () => {},

  // Room content
  lights = [],
  panels = [],
  navPanel = null,
  onNavigate = () => {}
}) {

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
    if (!albedo) return; // Skip texture loading if no textures provided
    
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
        // child.material.emissiveMap = ESETexture;
        // child.material.emissiveIntensity = 1;
        // child.material.roughnessMap = RNSTexture;       
        child.material.needsUpdate = true;
      }
    });
  }, [scene, albedo, opacity, metalness, roughness, emissive]);

  useEffect(() => {
    if (mode !== 'fps') return;
    if (!roomTexture) return;

    const textureLoader = new TextureLoader();
    textureLoader.load(roomTexture, (tex) => {
      tex.flipY = false;
      scene.traverse((child) => {
        if (!child.isMesh || !child.material) return;

        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (!mat) return;
            mat.map = tex;
            mat.needsUpdate = true;
          });
        } else {
          child.material.map = tex;
          child.material.needsUpdate = true;
        }
      });
    });
  }, [scene, mode, roomTexture]);

  useEffect(() => {
    if (mode !== 'fps') return;

    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = shadowsEnabled;
      child.receiveShadow = shadowsEnabled;
    });
  }, [scene, mode, shadowsEnabled]);

  // Different camera settings for different modes
  const cameraProps = mode === "fps" 
    ? { fov: 75, near: 0.1, far: 1000, position: [0, eyeHeight, 0] }
    : { fov: 30, near: 0.5, far: 9999 };

  return (
    <Canvas camera={cameraProps} shadows={shadowsEnabled}>
      {/* Lighting setup */}
      <ambientLight intensity={mode === "fps" ? 0.6 : 4} />
      <directionalLight 
        position={mode === "fps" ? [5, 5, 5] : [0, camPosY, -100]} 
        intensity={mode === "fps" ? 1 : 1.5} 
      />
      {mode === "viewer" && (
        <>
          <directionalLight position={[0,camPosY,100]} rotation={[0,0,0]} intensity={3} />
          <pointLight position={[posX+200, camPosY-50, posZ-100]} intensity={9} color={'#f403fc'}/>
        </>
      )}
      {mode === "fps" && (
        <>
          {defaultLightEnabled && (
            <>
              <directionalLight position={[-5, 5, -5]} intensity={0.35} castShadow={shadowsEnabled} />
              <pointLight position={[0, 2, 0]} intensity={0.2} castShadow={shadowsEnabled} />
            </>
          )}
          {lights.map((light, index) => (
            <RoomSpotLight
              key={light.id || `room-light-${index}`}
              light={{ ...light, castShadow: shadowsEnabled }}
            />
          ))}
        </>
      )}

      <Suspense fallback={null}>
        <primitive 
          object={scene} 
          rotation={mode === "fps" ? [0, 0, 0] : [rotX, rotY, rotZ]}
          position={mode === "fps" ? [0, 0, 0] : [posX, posY, posZ]}
          scale={mode === "fps" ? [1, 1, 1] : [scale, scale, scale]}
          castShadow={shadowsEnabled}
          receiveShadow={shadowsEnabled}
        />
        
        {/* Controls based on mode */}
        {mode === "viewer" && (
          <OrbitControls target={[posX, camPosY, posZ]}/>
        )}
        
        {mode === "fps" && (
          <>
            <FPSControls
              lookSpeed={lookSpeed}
              eyeHeight={eyeHeight}
              railMin={railMin}
              railMax={railMax}
              railPoints={railPoints}
              railPosition={railPosition ?? railStartPos}
              onRailPositionChange={onRailPositionChange}
              interactionMode={interactionMode}
              mobileLookSensitivity={mobileLookSensitivity}
              scrollSpeed={scrollSpeed}
              modalOpen={modalOpen}
            />
            {panels.map((p) => (
              <WallPanel
                key={p.id}
                position={p.position}
                rotation={p.rotation}
                scale={p.scale}
                image={p.image}
                title={p.title}
                caption={p.caption}
                description={p.description}
                videoUrl={p.videoUrl}
                links={p.links}
                modalOpen={modalOpen}
                interactionMode={interactionMode}
                onPanelClick={onPanelClick}
              />
            ))}
            {navPanel && (
              <NavPanel
                position={navPanel.position}
                rotation={navPanel.rotation}
                scale={navPanel.scale}
                wireColor={navPanel.color}
                label={navPanel.label}
                modalOpen={modalOpen}
                interactionMode={interactionMode}
                onNavigate={() => onNavigate(navPanel)}
              />
            )}
          </>
        )}
      </Suspense>
    </Canvas>
  );
}

export default ThreeDScene;
