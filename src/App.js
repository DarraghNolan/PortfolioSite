import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
const DetailsProject = React.lazy(() => import('./pages/DetailsProject'));

function App() {
  return (
    <ThemeProvider>
    <div className="App">      
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Home />} />
          
          {/* Wrap lazy-loaded component with Suspense */}
          <Route
            path="/detailsproject/:id"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <DetailsProject />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
    </ThemeProvider>
  );
}

export default App;
