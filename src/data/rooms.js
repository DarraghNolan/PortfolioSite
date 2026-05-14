export const rooms = [
  {
    id: 1,
    glb: '/2026/05/TestRoom1.glb',
    railMin: -2,
    railMax: 1,
    scrollSpeed: 0.005,
    eyeHeight: 1.67,
    panels: [
      {
        id: 'room1-panel1',
        position: [0, 1.5, 0],
        rotation: [0, Math.PI, 0],
        // Tier 1 — always visible
        image: '/2026/05/BluNPinkBox.png',
        // Tier 2 — shown when user looks at panel
        title: 'Dazariath',
        caption: 'Animation Reel',
        // Tier 3 — shown in modal when user clicks panel
        description: 'Collection of 3D animations I made over the years.',
        videoUrl: 'https://www.youtube.com/embed/gXPXQvk9A_4',
        links: [
          { label: 'Portfolio', url: 'https://dazariath.com' }
        ]
      }
    ],
    navPanel: {
      position: [3.25, 1.5, 0],
      rotation: [0, -Math.PI / 2, 0],
      label: 'Room 2 \u2192',
      nextRoomId: 2,
      nextRoute: '/room/2'
    }
  },
  {
    id: 2,
    glb: '/2026/05/TestRoom2.glb',
    railMin: -2,
    railMax: 1,
    scrollSpeed: 0.005,
    eyeHeight: 1.67,
    panels: [
      {
        id: 'room2-panel1',
        position: [-1.5, 1.5, 3.5],
        rotation: [0, Math.PI, 0],
        image: '/2026/05/BluNPinkBox.png',
        title: 'Test Panel',
        caption: 'Room 2 Content',
        description: 'This is a test panel in room 2.',
        videoUrl: '',
        links: []
      }
    ],
    navPanel: {
      position: [3.25, 1.5, 0],
      rotation: [0, -Math.PI / 2, 0],
      label: 'Room 3 \u2192',
      nextRoomId: 3,
      nextRoute: '/room/3'
    }
  },
  {
    id: 3,
    glb: '/2026/05/TestRoom3.glb',
    railMin: -2,
    railMax: 1,
    scrollSpeed: 0.005,
    eyeHeight: 1.67,
    panels: [
      {
        id: 'room3-panel1',
        position: [-1.5, 1.5, 3.5],
        rotation: [0, Math.PI, 0],
        image: '/2026/05/BluNPinkBox.png',
        title: 'Test Panel',
        caption: 'Room 3 Content',
        description: 'This is a test panel in room 3.',
        videoUrl: '',
        links: []
      }
    ],
    navPanel: {
      position: [3.25, 1.5, 0],
      rotation: [0, -Math.PI / 2, 0],
      label: 'Room 1 \u2192',
      nextRoomId: 1,
      nextRoute: '/room/1'
    }
  }
];

export const getRoomById = (id) =>
  rooms.find((r) => r.id === parseInt(id, 10)) || rooms[0];
