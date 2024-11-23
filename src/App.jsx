import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import StoryPlatform from './pages/StoryPlatform/StoryPlatform';

const App = () => {
  return (
    <BrowserRouter basename="/interactive-story">
      <StoryPlatform />
    </BrowserRouter>
  );
};

export default App;