import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Rail-based controls: scroll moves camera along a two-point XZ rail, mouse look rotates freely.
function FPSControls({
  lookSpeed = 0.002,
  eyeHeight = 1.67,
  railMin = -10,     // minimum X position along the rail
  railMax = 10,      // maximum X position along the rail
  railPoints = null, // [[startX, startZ], [endX, endZ]]
  scrollSpeed = 0.02, // units moved per scroll delta unit
  modalOpen = false,   // disable scroll when modal is open
  railPosition = 0,
  onRailPositionChange = () => {}
}) {
  const { camera, gl } = useThree();

  const railSegment = useRef({
    start: new THREE.Vector3(railMin, eyeHeight, 0),
    end: new THREE.Vector3(railMax, eyeHeight, 0)
  });
  const railLength = useRef(Math.max(0.001, railSegment.current.start.distanceTo(railSegment.current.end)));

  // Target percentage along the rail [0..1] updated by scroll
  const targetT = useRef(THREE.MathUtils.clamp(Number(railPosition) || 0, 0, 1));
  const smoothT = useRef(THREE.MathUtils.clamp(Number(railPosition) || 0, 0, 1));
  const modalOpenRef = useRef(modalOpen);
  const onRailPositionChangeRef = useRef(onRailPositionChange);

  // Mouse look state
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const pointerLocked = useRef(false);

  useEffect(() => {
    modalOpenRef.current = modalOpen;
  }, [modalOpen]);

  useEffect(() => {
    onRailPositionChangeRef.current = onRailPositionChange;
  }, [onRailPositionChange]);

  useEffect(() => {
    const resolveRailPoints = () => {
      if (Array.isArray(railPoints) && railPoints.length >= 2) {
        const start = Array.isArray(railPoints[0]) ? railPoints[0] : [];
        const end = Array.isArray(railPoints[1]) ? railPoints[1] : [];

        const startX = Number(start[0]);
        const startZ = Number(start[1]);
        const endX = Number(end[0]);
        const endZ = Number(end[1]);

        if ([startX, startZ, endX, endZ].every((n) => Number.isFinite(n))) {
          return {
            start: new THREE.Vector3(startX, eyeHeight, startZ),
            end: new THREE.Vector3(endX, eyeHeight, endZ)
          };
        }
      }

      return {
        start: new THREE.Vector3(railMin, eyeHeight, 0),
        end: new THREE.Vector3(railMax, eyeHeight, 0)
      };
    };

    railSegment.current = resolveRailPoints();
    railLength.current = Math.max(0.001, railSegment.current.start.distanceTo(railSegment.current.end));
    const startT = THREE.MathUtils.clamp(targetT.current, 0, 1);
    targetT.current = startT;
    smoothT.current = startT;

    // Place camera at rail start, eye height, facing forward along Z
    camera.position.copy(railSegment.current.start);
    camera.rotation.order = 'YXZ';
    camera.rotation.set(0, 0, 0);
    euler.current.set(0, 0, 0);

    // Scroll drives movement along the rail segment.
    const setRailTarget = (nextValue) => {
      const nextT = THREE.MathUtils.clamp(nextValue, 0, 1);
      targetT.current = nextT;
      onRailPositionChangeRef.current(nextT);
    };

    const handleWheel = (event) => {
      if (modalOpenRef.current) return; // Don't scroll if modal is open
      event.preventDefault();
      const deltaUnits = event.deltaY * scrollSpeed;
      const deltaT = deltaUnits / railLength.current;
      setRailTarget(targetT.current + deltaT);
    };

    // Mouse look (only active when pointer is locked)
    const handleMouseMove = (event) => {
      if (modalOpenRef.current) return;
      if (!pointerLocked.current) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= movementX * lookSpeed;
      euler.current.x -= movementY * lookSpeed;
      euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));

      camera.quaternion.setFromEuler(euler.current);
    };

    // Click canvas to lock pointer for mouse look
    const handleClick = () => {
      if (modalOpenRef.current) return;
      if (!pointerLocked.current) {
        gl.domElement.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      if (modalOpenRef.current && document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
        pointerLocked.current = false;
        return;
      }
      pointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    const handleWindowBlur = () => {
      pointerLocked.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('blur', handleWindowBlur);
    gl.domElement.addEventListener('click', handleClick);
    // Use the canvas element for wheel so it only fires when over the 3D view
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('blur', handleWindowBlur);
      gl.domElement.removeEventListener('click', handleClick);
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, lookSpeed, eyeHeight, railMin, railMax, railPoints, scrollSpeed]);

  useEffect(() => {
    const nextT = THREE.MathUtils.clamp(Number(railPosition) || 0, 0, 1);
    targetT.current = nextT;
  }, [railPosition]);

  // Each frame: smoothly move to target percentage along rail, lock Y to eye height.
  useFrame(() => {
    smoothT.current = THREE.MathUtils.lerp(smoothT.current, targetT.current, 0.1);
    const point = new THREE.Vector3().lerpVectors(
      railSegment.current.start,
      railSegment.current.end,
      smoothT.current
    );
    camera.position.x = point.x;
    camera.position.y = eyeHeight;
    camera.position.z = point.z;
  });

  return null;
}

export default FPSControls;