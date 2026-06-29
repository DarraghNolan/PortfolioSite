import React, { Suspense, useState, useEffect } from 'react';
import ThreeDScene from './ThreeDScene';
import { getRoomById } from '../data/rooms';

function RoomPage({
  roomId = 1,
  roomData = null,
  onNavigateRoom = () => {},
  onNavigateRoute = () => {}
}) {
  const room = roomData || getRoomById(roomId || 1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '', description: '', videoUrl: '', links: []
  });

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
        <div>ESC to exit mouse look</div>
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
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            padding: '40px',
            borderRadius: '10px',
            width: '680px',
            maxWidth: '92vw',
            maxHeight: '88vh',
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
          railMin={room.railMin}
          railMax={room.railMax}
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
