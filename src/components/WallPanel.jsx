import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function estimateLineCount(text, width, fontSize) {
  if (!text) return 0;
  const charsPerLine = Math.max(6, Math.floor(width / Math.max(0.0001, fontSize * 0.52)));
  const roughLines = Math.ceil(text.length / charsPerLine);
  return Math.max(1, roughLines);
}

function fitFontSizeToZone(text, zoneWidth, zoneHeight, minSize, maxSize, lineHeight) {
  if (!text || zoneHeight <= 0 || zoneWidth <= 0) {
    return minSize;
  }

  let low = minSize;
  let high = maxSize;
  let best = minSize;

  for (let i = 0; i < 14; i += 1) {
    const mid = (low + high) / 2;
    const lines = estimateLineCount(text, zoneWidth, mid);
    const requiredHeight = lines * mid * lineHeight;

    if (requiredHeight <= zoneHeight) {
      best = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return clamp(best, minSize, maxSize);
}

function truncateToFit(text, zoneWidth, zoneHeight, fontSize, lineHeight) {
  if (!text) return '';

  const maxLines = Math.max(1, Math.floor(zoneHeight / Math.max(0.0001, fontSize * lineHeight)));
  const charsPerLine = Math.max(6, Math.floor(zoneWidth / Math.max(0.0001, fontSize * 0.52)));
  const maxChars = maxLines * charsPerLine;

  if (text.length <= maxChars) return text;

  const sliced = text.slice(0, Math.max(0, maxChars - 1)).trim();
  return `${sliced}…`;
}

// Three-tier wall panel:
// Tier 1 — image texture, always visible
// Tier 2 — title + caption, shown when crosshair is on panel
// Tier 3 — description, video, links, shown in modal on click
function WallPanel({
  position = [0, 1.5, 0],
  rotation = [0, 0, 0],
  scale = [2, 1.5],
  image = null,
  title = 'Panel Title',
  caption = 'Caption text',
  description = '',
  videoUrl = '',
  links = [],
  modalOpen = false,
  onPanelClick = () => {}
}) {
  const meshRef = useRef();
  const titleRef = useRef();
  const captionRef = useRef();
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const centerScreen = new THREE.Vector2(0, 0);

  const width = Math.max(0.1, Number(scale?.[0] ?? 2));
  const height = Math.max(0.1, Number(scale?.[1] ?? 1.5));

  // Layout zones: heading gets top 1/4, caption gets bottom 3/4.
  const panelPaddingX = width * 0.05;
  const panelPaddingY = height * 0.06;
  const contentWidth = Math.max(0.2, width - panelPaddingX * 2);
  const headingZoneHeight = Math.max(0.08, height * 0.25 - panelPaddingY);
  const captionZoneHeight = Math.max(0.12, height * 0.75 - panelPaddingY * 2);
  const headingZoneCenterY = (height / 2) - (height * 0.125);
  const captionZoneCenterY = -height * 0.125;

  const textLayout = useMemo(() => {
    const cleanTitle = (title || '').replace(/\s+/g, ' ').trim();
    const cleanCaption = (caption || '').replace(/\s+/g, ' ').trim();

    const fittedTitleSize = fitFontSizeToZone(
      cleanTitle,
      contentWidth,
      headingZoneHeight,
      0.05,
      clamp(height * 0.16, 0.07, 0.22),
      1.15
    );

    const fittedCaptionSize = fitFontSizeToZone(
      cleanCaption,
      contentWidth,
      captionZoneHeight,
      0.045,
      clamp(height * 0.11, 0.06, 0.16),
      1.35
    );

    const fittedTitleText = truncateToFit(
      cleanTitle,
      contentWidth,
      headingZoneHeight,
      fittedTitleSize,
      1.15
    );

    const fittedCaptionText = truncateToFit(
      cleanCaption,
      contentWidth,
      captionZoneHeight,
      fittedCaptionSize,
      1.35
    );

    return {
      titleText: fittedTitleText,
      captionText: fittedCaptionText,
      titleSize: fittedTitleSize,
      captionSize: fittedCaptionSize,
    };
  }, [title, caption, contentWidth, headingZoneHeight, captionZoneHeight, height]);

  // Keep outline weight visually consistent across different fitted font sizes.
  const titleOutlineWidth = Math.max(0.014, textLayout.titleSize * 0.16);
  const captionOutlineWidth = Math.max(0.014, textLayout.captionSize * 0.16);

  // Tier 1: load image texture onto mesh
  useEffect(() => {
    if (!image) return;
    const loader = new THREE.TextureLoader();
    loader.load(image, (tex) => {
      if (!meshRef.current) return;
      meshRef.current.material.map = tex;
      meshRef.current.material.color.set('#aaaaaa');
      meshRef.current.material.needsUpdate = true;
    });
  }, [image]);

  // Tier 2: darken panel on hover for readability, toggle text visibility.
  useFrame(() => {
    if (!meshRef.current) return;
    raycaster.current.setFromCamera(centerScreen, camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    // Not hovered: brighter panel. Hovered: darker panel so text stands out.
    meshRef.current.material.color.set(hit ? '#b8b8b8' : (image ? '#ffffff' : '#e3e3e3'));
    meshRef.current.material.transparent = true;
    meshRef.current.material.opacity = hit ? 0.95 : 1;
    if (titleRef.current) titleRef.current.visible = hit;
    if (captionRef.current) captionRef.current.visible = hit;
  });

  // Tier 3: open modal on click
  const handleCanvasClick = () => {
    if (modalOpen) return;
    if (document.pointerLockElement !== gl.domElement) return;
    raycaster.current.setFromCamera(centerScreen, camera);
    const hit = raycaster.current.intersectObject(meshRef.current).length > 0;
    if (hit) onPanelClick({ title, caption, description, videoUrl, links });
  };

  useEffect(() => {
    gl.domElement.addEventListener('click', handleCanvasClick);
    return () => gl.domElement.removeEventListener('click', handleCanvasClick);
  }, [gl, onPanelClick, title, caption, description, videoUrl, links, modalOpen]);

  return (
    <group position={position} rotation={rotation}>
      {/* Panel face */}
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#888888" side={THREE.DoubleSide} />
      </mesh>

      {/* Tier 2: title */}
      <Text
        ref={titleRef}
        visible={false}
        position={[0, headingZoneCenterY, 0.01]}
        fontSize={textLayout.titleSize}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={contentWidth}
        textAlign="center"
        lineHeight={1.15}
        outlineWidth={titleOutlineWidth}
        outlineOpacity={1}
        outlineColor="#000000"
        font={undefined}
      >
        {textLayout.titleText}
      </Text>

      {/* Tier 2: caption */}
      <Text
        ref={captionRef}
        visible={false}
        position={[0, captionZoneCenterY, 0.01]}
        fontSize={textLayout.captionSize}
        color="#eeeeee"
        anchorX="center"
        anchorY="middle"
        maxWidth={contentWidth}
        textAlign="center"
        lineHeight={1.35}
        outlineWidth={captionOutlineWidth}
        outlineOpacity={1}
        outlineColor="#000000"
        font={undefined}
      >
        {textLayout.captionText}
      </Text>
    </group>
  );
}

export default WallPanel;
