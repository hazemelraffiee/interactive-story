import { BrowserRouter } from 'react-router-dom';
import React, { useEffect } from 'react';
import StoryPlatform from './pages/StoryPlatform/StoryPlatform';

const App = () => {

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <BrowserRouter basename="/interactive-story">
      <StoryPlatform />
    </BrowserRouter>
  );
};

export default App;