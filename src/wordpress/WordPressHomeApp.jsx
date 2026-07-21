import React, { useEffect, useMemo, useState } from 'react';
import RoomPage from '../pages/RoomPage';
import { rooms as fallbackRooms } from '../data/rooms';

function resolveUploadsUrl(url, uploadsBaseUrl) {
  if (!url || typeof url !== 'string') return '';
  if (/^(https?:)?\/\//i.test(url)) return url;

  const uploadsBase = (uploadsBaseUrl || '').replace(/\/+$/, '');
  if (!uploadsBase) return url;

  const normalizedPath = url
    .replace(/^\/wp-content\/uploads\//i, '')
    .replace(/^wp-content\/uploads\//i, '')
    .replace(/^\//, '');

  if (!normalizedPath) {
    return uploadsBase;
  }

  return `${uploadsBase}/${normalizedPath}`;
}

function normalizeRoomAssets(rawRooms, uploadsBaseUrl) {
  if (!Array.isArray(rawRooms)) return [];

  const normalizeVector3 = (value, fallback) => {
    if (!Array.isArray(value) || value.length < 3) return fallback;
    return [
      Number.isFinite(Number(value[0])) ? Number(value[0]) : fallback[0],
      Number.isFinite(Number(value[1])) ? Number(value[1]) : fallback[1],
      Number.isFinite(Number(value[2])) ? Number(value[2]) : fallback[2]
    ];
  };

  const clamp = (value, min, max, fallback) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  };

  const normalizeHex = (value, fallback = '#ffffff') => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return /^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(trimmed) ? trimmed : fallback;
  };

  return rawRooms.map((room) => ({
    ...room,
    glb: resolveUploadsUrl(room.glb, uploadsBaseUrl),
    texture: resolveUploadsUrl(room.texture, uploadsBaseUrl),
    defaultLightEnabled: room.defaultLightEnabled !== false,
    shadowsEnabled: room.shadowsEnabled === true,
    lights: Array.isArray(room.lights)
      ? room.lights.map((light, index) => ({
          id: typeof light?.id === 'string' && light.id ? light.id : `room${room.id}-light${index + 1}`,
          position: normalizeVector3(light?.position, [0, 2.5, 0]),
          rotation: normalizeVector3(light?.rotation, [0, 0, 0]),
          angleDeg: clamp(light?.angleDeg, 1, 89, 45),
          intensity: clamp(light?.intensity, 0, 1, 0.6),
          color: normalizeHex(light?.color)
        }))
      : [],
    panels: Array.isArray(room.panels)
      ? room.panels.map((panel) => ({
          ...panel,
          image: resolveUploadsUrl(panel.image, uploadsBaseUrl),
          links: Array.isArray(panel.links) ? panel.links : []
        }))
      : []
  }));
}

function WordPressHomeApp() {
  const settings = (typeof window !== 'undefined' && window.Portfolio3DHomeSettings)
    ? window.Portfolio3DHomeSettings
    : {};

  const debugEnabled = Boolean(settings.debugEnabled)
    || (typeof window !== 'undefined' && window.location.search.includes('p3d-debug=1'))
    || (typeof window !== 'undefined' && window.localStorage.getItem('p3dDebug') === '1');

  const logger = useMemo(() => ({
    log: (...args) => {
      if (debugEnabled) {
        console.log('[P3D]', ...args);
      }
    },
    warn: (...args) => {
      if (debugEnabled) {
        console.warn('[P3D]', ...args);
      }
    }
  }), [debugEnabled]);

  const { log, warn } = logger;

  const [rooms, setRooms] = useState(normalizeRoomAssets(fallbackRooms, settings.uploadsBaseUrl));
  const [currentRoomId, setCurrentRoomId] = useState(1);

  useEffect(() => {
    const endpoint = settings.apiEndpoint;
    if (!endpoint) {
      warn('No apiEndpoint provided; using fallback room data only.');
      return;
    }

    let ignore = false;
    let requestUrl = endpoint;

    if (debugEnabled) {
      try {
        const parsed = new URL(endpoint, window.location.origin);
        parsed.searchParams.set('debug', '1');
        requestUrl = parsed.toString();
      } catch {
        const sep = endpoint.includes('?') ? '&' : '?';
        requestUrl = `${endpoint}${sep}debug=1`;
      }
    }

    log('Fetching rooms payload', {
      endpoint,
      requestUrl,
      uploadsBaseUrl: settings.uploadsBaseUrl,
      debugEnabled
    });

    fetch(requestUrl)
      .then((response) => {
        log('Rooms fetch completed', { status: response.status, ok: response.ok });
        if (!response.ok) throw new Error(`Failed to load rooms: ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (ignore) return;
        const nextRooms = normalizeRoomAssets(payload?.rooms, settings.uploadsBaseUrl);
        log('Rooms payload parsed', { roomCount: nextRooms.length, payloadKeys: Object.keys(payload || {}) });

        if (debugEnabled) {
          nextRooms.forEach((room) => {
            (room.panels || []).forEach((panel) => {
              const hasContent = (panel.title || panel.caption || panel.description || panel.videoUrl || (panel.links && panel.links.length > 0));
              if (hasContent) {
                console.log(`[P3D] Room ${room.id} panel "${panel.slug}" — content OK`, {
                  title: panel.title,
                  caption: panel.caption,
                  descLen: (panel.description || '').length,
                  hasVideo: Boolean(panel.videoUrl),
                  links: panel.links
                });
              } else {
                console.warn(`[P3D] Room ${room.id} panel "${panel.slug}" — EMPTY. PHP debug:`, panel._debug || '(no _debug key — redeploy plugin)');
              }
            });
          });
        }

        if (nextRooms.length > 0) {
          setRooms(nextRooms);
          if (!nextRooms.some((room) => room.id === currentRoomId)) {
            setCurrentRoomId(nextRooms[0].id);
          }
        } else {
          warn('Rooms payload returned zero rooms; keeping fallback data.');
        }
      })
      .catch((error) => {
        warn('Rooms fetch failed; keeping fallback local data.', error);
      });

    return () => {
      ignore = true;
    };
  }, [settings.apiEndpoint, settings.uploadsBaseUrl, currentRoomId, debugEnabled, log, warn]);

  const activeRoom = useMemo(() => {
    if (!Array.isArray(rooms) || rooms.length === 0) return null;
    return rooms.find((room) => room.id === Number(currentRoomId)) || rooms[0];
  }, [rooms, currentRoomId]);

  useEffect(() => {
    if (!debugEnabled) return;
    log('Active room changed', {
      currentRoomId,
      activeRoomId: activeRoom?.id,
      panelCount: Array.isArray(activeRoom?.panels) ? activeRoom.panels.length : 0,
      roomIds: Array.isArray(rooms) ? rooms.map((room) => room.id) : []
    });
  }, [debugEnabled, currentRoomId, activeRoom, rooms, log]);

  if (!activeRoom) {
    warn('No active room available.');
    return <div style={{ color: '#fff', padding: '20px' }}>No rooms configured.</div>;
  }

  return (
    <RoomPage
      roomId={activeRoom.id}
      roomData={activeRoom}
      onNavigateRoom={(nextRoomId) => {
        log('Navigating to room', { nextRoomId });
        setCurrentRoomId(nextRoomId);
      }}
    />
  );
}

export default WordPressHomeApp;
