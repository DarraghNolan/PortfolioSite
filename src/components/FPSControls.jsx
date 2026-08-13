import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { normalizeRailPointsList, buildRailPath, samplePathAtProgress } from '../utils/railPath';

// Rail-based controls: scroll moves camera along a multi-point 3D path, mouse look rotates freely.
function FPSControls({
  lookSpeed = 0.002,
  eyeHeight = 1.67,
  railPoints = null, // [{ x, y, z, order }]
  railLoop = false,
  scrollSpeed = 0.02, // units moved per scroll delta unit
  modalOpen = false,   // disable scroll when modal is open
  railPosition = 0,
  onRailPositionChange = () => {},
  interactionMode = 'desktop',
  mobileLookSensitivity = 0.006
}) {
  const { camera, gl } = useThree();

  const railPath = useRef(buildRailPath(normalizeRailPointsList(railPoints), railLoop));

  // Target percentage along the rail [0..1] updated by scroll
  const targetT = useRef(THREE.MathUtils.clamp(Number(railPosition) || 0, 0, 1));
  const smoothT = useRef(THREE.MathUtils.clamp(Number(railPosition) || 0, 0, 1));
  const modalOpenRef = useRef(modalOpen);
  const onRailPositionChangeRef = useRef(onRailPositionChange);

  // Mouse look state
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const pointerLocked = useRef(false);
  const activeTouchId = useRef(null);
  const touchLast = useRef({ x: 0, y: 0 });
  const isTouchDragging = useRef(false);

  useEffect(() => {
    modalOpenRef.current = modalOpen;
  }, [modalOpen]);

  useEffect(() => {
    onRailPositionChangeRef.current = onRailPositionChange;
  }, [onRailPositionChange]);

  useEffect(() => {
    railPath.current = buildRailPath(normalizeRailPointsList(railPoints), railLoop);
    const startT = THREE.MathUtils.clamp(targetT.current, 0, 1);
    targetT.current = startT;
    smoothT.current = startT;

    // Place camera at rail start, facing forward along Z
    const startPoint = samplePathAtProgress(railPath.current, startT);
    camera.position.set(startPoint.x, startPoint.y, startPoint.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.set(0, 0, 0);
    euler.current.set(0, 0, 0);

    // Scroll drives movement along the rail path.
    const setRailTarget = (nextValue) => {
      const nextT = THREE.MathUtils.clamp(nextValue, 0, 1);
      targetT.current = nextT;
      onRailPositionChangeRef.current(nextT);
    };

    const handleWheel = (event) => {
      if (modalOpenRef.current) return; // Don't scroll if modal is open
      event.preventDefault();
      const deltaUnits = event.deltaY * scrollSpeed;
      const deltaT = deltaUnits / railPath.current.totalLength;
      setRailTarget(targetT.current + deltaT);
    };

    // Shared look math for desktop mouse and mobile touch drag.
    const applyLookDelta = (deltaX, deltaY, sensitivity) => {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= deltaX * sensitivity;
      euler.current.x -= deltaY * sensitivity;
      euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    // Mouse look (only active when pointer is locked)
    const handleMouseMove = (event) => {
      if (modalOpenRef.current) return;
      if (!pointerLocked.current) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      applyLookDelta(movementX, movementY, lookSpeed);
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

    // Mobile drag-look: top 90% of screen controls camera, bottom 10% is reserved for rail UI.
    const handlePointerDown = (event) => {
      if (modalOpenRef.current) return;
      if (event.pointerType !== 'touch') return;
      const touchBoundaryY = window.innerHeight * 0.9;
      if (event.clientY > touchBoundaryY) return;

      activeTouchId.current = event.pointerId;
      touchLast.current = { x: event.clientX, y: event.clientY };
      isTouchDragging.current = false;

      if (typeof gl.domElement.setPointerCapture === 'function') {
        try {
          gl.domElement.setPointerCapture(event.pointerId);
        } catch {
          // Ignore capture failures on browsers that reject late capture.
        }
      }
    };

    const handlePointerMove = (event) => {
      if (modalOpenRef.current) return;
      if (event.pointerType !== 'touch') return;
      if (activeTouchId.current !== event.pointerId) return;

      event.preventDefault();

      const deltaX = event.clientX - touchLast.current.x;
      const deltaY = event.clientY - touchLast.current.y;
      touchLast.current = { x: event.clientX, y: event.clientY };

      if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
        isTouchDragging.current = true;
      }

      applyLookDelta(deltaX, deltaY, mobileLookSensitivity);
    };

    const handlePointerUp = (event) => {
      if (event.pointerType !== 'touch') return;
      if (activeTouchId.current === event.pointerId) {
        if (typeof gl.domElement.releasePointerCapture === 'function') {
          try {
            gl.domElement.releasePointerCapture(event.pointerId);
          } catch {
            // Ignore release failures when capture is already cleared.
          }
        }
        activeTouchId.current = null;
        isTouchDragging.current = false;
      }
    };

    if (interactionMode === 'mobile') {
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
      pointerLocked.current = false;
      gl.domElement.style.touchAction = 'none';
      gl.domElement.style.userSelect = 'none';
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      gl.domElement.addEventListener('pointermove', handlePointerMove, { passive: false });
      gl.domElement.addEventListener('pointerup', handlePointerUp);
      gl.domElement.addEventListener('pointercancel', handlePointerUp);
    } else {
      gl.domElement.style.touchAction = '';
      gl.domElement.style.userSelect = '';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('pointerlockchange', handlePointerLockChange);
      window.addEventListener('blur', handleWindowBlur);
      gl.domElement.addEventListener('click', handleClick);
      // Use the canvas element for wheel so it only fires when over the 3D view
      gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      gl.domElement.style.touchAction = '';
      gl.domElement.style.userSelect = '';
      gl.domElement.removeEventListener('pointerdown', handlePointerDown);
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
      gl.domElement.removeEventListener('pointerup', handlePointerUp);
      gl.domElement.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('blur', handleWindowBlur);
      gl.domElement.removeEventListener('click', handleClick);
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, lookSpeed, eyeHeight, railPoints, railLoop, scrollSpeed, interactionMode, mobileLookSensitivity]);

  useEffect(() => {
    const nextT = THREE.MathUtils.clamp(Number(railPosition) || 0, 0, 1);
    targetT.current = nextT;
  }, [railPosition]);

  // Each frame: smoothly move to target percentage along the rail path.
  useFrame(() => {
    smoothT.current = THREE.MathUtils.lerp(smoothT.current, targetT.current, 0.1);
    const point = samplePathAtProgress(railPath.current, smoothT.current);
    camera.position.x = point.x;
    camera.position.y = point.y;
    camera.position.z = point.z;
  });

  return null;
}

export default FPSControls;