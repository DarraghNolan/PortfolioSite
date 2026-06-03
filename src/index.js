import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import WordPressHomeApp from './wordpress/WordPressHomeApp';
import reportWebVitals from './reportWebVitals';

const wpRootElement = document.getElementById('portfolio-3d-home-root');
const appRootElement = document.getElementById('root');
const isStandaloneRoot = Boolean(appRootElement && appRootElement.dataset && appRootElement.dataset.p3dSpaRoot === '1');

const shouldLog = () => {
  try {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('p3dDebug') : null;
    return search.includes('p3d-debug=1') || stored === '1' || Boolean(window?.Portfolio3DHomeSettings?.debugEnabled);
  } catch {
    return Boolean(window?.Portfolio3DHomeSettings?.debugEnabled);
  }
};

if (shouldLog()) {
  console.log('[P3D] index.js boot', {
    hasWpRoot: Boolean(wpRootElement),
    hasSpaRoot: Boolean(appRootElement),
    isStandaloneRoot,
    pathname: window.location.pathname,
    search: window.location.search
  });
}

window.addEventListener('error', (event) => {
  if (!shouldLog()) return;
  console.error('[P3D] window error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  if (!shouldLog()) return;
  console.error('[P3D] unhandled promise rejection', event.reason);
});

if (wpRootElement) {
  if (shouldLog()) {
    console.log('[P3D] mounting WordPressHomeApp');
  }
  const wpRoot = ReactDOM.createRoot(wpRootElement);
  wpRoot.render(
    <React.StrictMode>
      <WordPressHomeApp />
    </React.StrictMode>
  );
} else if (isStandaloneRoot) {
  if (shouldLog()) {
    console.log('[P3D] mounting App SPA shell');
  }
  const appRoot = ReactDOM.createRoot(appRootElement);
  appRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else if (shouldLog()) {
  console.log('[P3D] no eligible mount target found; script idle.');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
