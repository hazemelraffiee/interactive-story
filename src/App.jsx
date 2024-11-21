import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoryPlatform from './pages/StoryPlatform/StoryPlatform';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<StoryPlatform />} />
      </Routes>
    </Router>
  );
}

export default App;
