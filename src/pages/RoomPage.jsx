import React, { Suspense, useState, useEffect } from 'react';
import ThreeDScene from './ThreeDScene';
import { getRoomById } from '../data/rooms';
import { useProgress } from '@react-three/drei';

function LoadingOverlay({ loadingScreenImage = '', loadingBarOffset = 0 }) {
  const { active, progress } = useProgress();

  if (!active) return null;

  const clamped = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
  const barOffset = Number.isFinite(Number(loadingBarOffset)) ? Number(loadingBarOffset) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        zIndex: 3000,
        backgroundColor: '#000000',
      }}
    >
      {loadingScreenImage ? (
        <picture
          className="p3d-loading-picture"
          style={{
            position: 'absolute',
            inset: 0,
            margin: 'auto',
            width: '100vw',
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            className="p3d-loading-img"
            src={loadingScreenImage}
            alt="Loading"
            style={{
              width: '100vw',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
            }}
          />
        </picture>
      ) : null}

      <div
        className="p3d-loading-progress"
        style={{
          position: 'absolute',
          left: '50%',
          top: `calc(50% + ${barOffset}vh)`,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          width: '50vw',
          maxWidth: '900px',
          minWidth: '220px',
          height: '2em',
          borderRadius: '999px',
          border: '2px solid rgba(255,255,255,0.75)',
          backgroundColor: 'rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4fd1ff 0%, #7bff98 100%)',
            transition: 'width 140ms ease-out',
          }}
        />
      </div>

      {!loadingScreenImage ? (
        <div
          style={{
            position: 'absolute',
            top: `calc(50% + ${barOffset}vh + 2.3em)`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.95rem',
            letterSpacing: '0.02em',
            fontWeight: 600,
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            pointerEvents: 'none',
          }}
        >
          Loading room...
        </div>
      ) : null}

      <style>{`
        @media (max-width: 1024px) {
          .p3d-loading-img {
            width: 100%;
            height: 100vh;
            object-fit: cover;
          }
          .p3d-loading-progress {
            width: 50vw;
          }
        }
        @media (max-width: 767px) {
          .p3d-loading-progress {
            width: 80vw;
          }
        }
      `}</style>
    </div>
  );
}

function RoomPage({
  roomId = 1,
  roomData = null,
  loadingScreenImage = '',
  loadingBarOffset = 0,
  onNavigateRoom = () => {},
  onNavigateRoute = () => {}
}) {
  const room = roomData || getRoomById(roomId || 1);
  const clampRailPos = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [railPosition, setRailPosition] = useState(0);
  const initialRailStartPos = Math.max(0, Math.min(1, Number(room?.railStartPos ?? 0) || 0));
  const [modalContent, setModalContent] = useState({
    title: '', description: '', videoUrl: '', links: []
  });

  useEffect(() => {
    setRailPosition(initialRailStartPos);
  }, [room?.id, initialRailStartPos]);

  useEffect(() => {
    if (modalOpen && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [modalOpen]);

  const handlePanelClick = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    const canvas = document.querySelector('canvas');
    if (canvas && canvas.requestPointerLock) canvas.requestPointerLock();
  };

  const handleNavigate = (navPanel) => {
    if (!navPanel) return;

    if (typeof navPanel.nextRoomId === 'number') {
      onNavigateRoom(navPanel.nextRoomId);
      return;
    }

    if (typeof navPanel.nextRoute === 'string' && navPanel.nextRoute) {
      onNavigateRoute(navPanel.nextRoute);
    }
  };

  if (!room) {
    return <div style={{ color: '#fff', padding: '20px' }}>Room not found.</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, margin: 0, padding: 0, overflow: 'hidden' }}>
      <LoadingOverlay loadingScreenImage={loadingScreenImage} loadingBarOffset={loadingBarOffset} />

      {/* Crosshair */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        pointerEvents: 'none',
        zIndex: 1000,
      }} />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <div>Scroll to move along the corridor</div>
        <div>Click to enable mouse look</div>
        <div>ESC to exit mouse look and use rail slider</div>
      </div>

      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '18px',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          width: 'min(720px, calc(100vw - 32px))',
          background: 'rgba(0, 0, 0, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '999px',
          padding: '10px 14px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: modalOpen ? 'none' : 'auto',
          opacity: modalOpen ? 0.45 : 1,
        }}
      >
        <span style={{ color: '#ffffff', fontSize: '12px', whiteSpace: 'nowrap' }}>Rail</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={railPosition}
          onChange={(event) => setRailPosition(clampRailPos(event.target.value))}
          style={{ width: '100%' }}
          aria-label="Rail position"
        />
        <span style={{ color: '#c7d9ff', fontSize: '12px', minWidth: '42px', textAlign: 'right' }}>
          {Math.round(railPosition * 100)}%
        </span>
      </div>

      {/* Modal Overlay */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          paddingTop: '20em !important',
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            padding: '40px',
            borderRadius: '10px',
            width: '680px',
            maxWidth: '92vw',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
            border: '1px solid #444',
            boxShadow: '0 12px 48px rgba(0,0,0,0.9)'
          }}>

            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '26px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* Title */}
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '26px' }}>
              {modalContent.title}
            </h2>

            {/* Video iframe */}
            {modalContent.videoUrl && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '24px' }}>
                <iframe
                  src={modalContent.videoUrl}
                  title={modalContent.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                />
              </div>
            )}

            {/* Description */}
            {modalContent.description && (
              <div
                style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}
                dangerouslySetInnerHTML={{ __html: modalContent.description }}
              />
            )}

            {/* External links */}
            {modalContent.links && modalContent.links.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {modalContent.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 18px',
                      backgroundColor: '#2266aa',
                      color: 'white',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Scene */}
      <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading room...</div>}>
        <ThreeDScene
          mode="fps"
          url={room.glb}
          roomTexture={room.texture}
          defaultLightEnabled={room.defaultLightEnabled}
          shadowsEnabled={room.shadowsEnabled}
          lights={room.lights}
          railMin={room.railMin}
          railMax={room.railMax}
          railPoints={room.railPoints}
          railStartPos={room.railStartPos ?? 0}
          railPosition={railPosition}
          onRailPositionChange={setRailPosition}
          scrollSpeed={room.scrollSpeed}
          lookSpeed={0.002}
          eyeHeight={room.eyeHeight}
          panels={room.panels}
          navPanel={room.navPanel}
          modalOpen={modalOpen}
          onPanelClick={handlePanelClick}
          onNavigate={handleNavigate}
        />
      </Suspense>
    </div>
  );
}

export default RoomPage;
