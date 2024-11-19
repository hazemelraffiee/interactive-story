// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoryDesigner from './components/StoryDesigner/StoryDesigner';
import InteractiveStory from './components/InteractiveStory/InteractiveStory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoryDesigner />} />
        <Route path="/interactive-story" element={<InteractiveStory />} />
      </Routes>
    </Router>
  );
}

export default App;
