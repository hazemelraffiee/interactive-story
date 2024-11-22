import React, { useState, useEffect } from 'react';
import { Coffee, MessageCircle, Brain, ArrowRight, AlertTriangle } from 'lucide-react';

// Define animations
export const animationStyles = `
  /* Default fade in animation */
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  /* Slide in from right */
  @keyframes slideInRight {
    0% { opacity: 0; transform: translateX(50px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  .animate-slideInRight {
    animation: slideInRight 0.5s ease-out forwards;
  }

  /* Earthquake effect */
  @keyframes earthquake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px) rotate(-1deg); }
    75% { transform: translateX(5px) rotate(1deg); }
  }
  .animate-earthquake {
    animation: earthquake 0.3s ease-in-out infinite;
  }
`;

const parseContent = (raw) => {
  if (!raw) return [];
  return raw.split('\n\n').map((block) => {
    if (block.startsWith('>')) {
      const [, speaker, text] = block.match(/^> (.*?): (.*)$/) || [];
      return { type: 'dialogue', speaker, text };
    }
    if (block.startsWith('*') && block.endsWith('*')) {
      return { type: 'thought', text: block.slice(1, -1) };
    }
    return { type: 'narrative', text: block };
  });
};

const ContentBlock = ({ item }) => {
  if (!item) return null;
  switch (item.type) {
    case 'dialogue':
      return (
        <div className="my-4 pl-4 border-l-4 border-purple-200">
          <div className="flex items-start gap-2">
            <MessageCircle className="w-5 h-5 mt-1 text-purple-500" />
            <div>
              <span className="font-semibold text-purple-600">{item.speaker}:</span>
              <p className="text-lg italic">{item.text}</p>
            </div>
          </div>
        </div>
      );
    case 'thought':
      return (
        <div className="my-4 pl-4 border-l-4 border-purple-200 bg-purple-50 p-3 rounded-r">
          <div className="flex items-start gap-2">
            <Brain className="w-5 h-5 mt-1 text-purple-500" />
            <p className="text-lg italic text-purple-800">{item.text}</p>
          </div>
        </div>
      );
    default:
      return (
        <p className="text-lg leading-relaxed mb-6 text-gray-800">{item.text}</p>
      );
  }
};

const DecisionButton = ({ decision, chapter, scenes, allChapters, onDecision }) => {
  const isValidPath = decision.nextChapter
    ? allChapters.includes(decision.nextChapter)
    : decision.nextScene && scenes.includes(decision.nextScene);

  const errorMessage = decision.nextChapter
    ? `Chapter "${decision.nextChapter}" not implemented`
    : `Scene "${decision.nextScene}" not implemented`;

  return (
    <button
      onClick={() => isValidPath && onDecision(decision)}
      className={`w-full p-4 text-left rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:translate-x-1 ${
        isValidPath
          ? 'bg-gray-100 hover:bg-gray-200'
          : 'bg-red-50 border-2 border-red-200 cursor-not-allowed'
      }`}
      disabled={!isValidPath}
    >
      {isValidPath ? (
        <ArrowRight className="w-5 h-5 text-gray-600" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-red-500" />
      )}
      <div className="flex-1">
        <span className={isValidPath ? 'text-gray-800' : 'text-red-800'}>
          {decision.text}
        </span>
        {!isValidPath && (
          <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
        )}
      </div>
    </button>
  );
};

export const Scene = ({ scene, showDecisions = false, onDecision, chapter, chapters }) => {
  if (!scene) return null;
  const animationClass = scene.animation
    ? `animate-${scene.animation}`
    : 'animate-fadeIn';

  return (
    <div
      className={`mb-8 p-6 bg-white rounded-lg shadow-sm transition-all duration-500 hover:shadow-md ${animationClass}`}
    >
      <article className="prose prose-lg max-w-none">
        {parseContent(scene.content).map((item, index) => (
          <ContentBlock key={index} item={item} />
        ))}
      </article>

      {showDecisions && scene.decisions && (
        <div className="mt-8 space-y-4">
          {scene.decisions.map((decision, index) => (
            <DecisionButton
              key={index}
              decision={decision}
              chapter={chapter}
              scenes={Object.keys(chapters[chapter].scenes)}
              allChapters={Object.keys(chapters)}
              onDecision={onDecision}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const InteractiveStoryViewer = ({ story }) => {
  const [currentChapter, setCurrentChapter] = useState('');
  const [storyHistory, setStoryHistory] = useState([]);

  // Add animation styles on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize story
  useEffect(() => {
    if (story && story.chapters && Object.keys(story.chapters).length > 0) {
      const firstChapterId = Object.keys(story.chapters)[0];
      const firstChapter = story.chapters[firstChapterId];
      const firstSceneId = firstChapter.firstSceneId || Object.keys(firstChapter.scenes)[0];

      setCurrentChapter(firstChapterId);
      setStoryHistory([
        {
          chapterId: firstChapterId,
          sceneId: firstSceneId,
        },
      ]);
    }
  }, [story]);

  // Early return with loading state
  if (!story || !story.title || !story.chapters || Object.keys(story.chapters).length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">
          No story to display. Please add chapters and scenes.
        </p>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Loading story...</p>
      </div>
    );
  }

  const chapter = story.chapters[currentChapter];

  const handleDecision = (decision) => {
    if (decision.nextChapter) {
      const nextChapter = story.chapters[decision.nextChapter];
      if (nextChapter) {
        setCurrentChapter(decision.nextChapter);
        setStoryHistory((prev) => [
          ...prev,
          {
            chapterId: decision.nextChapter,
            sceneId: nextChapter.firstSceneId || Object.keys(nextChapter.scenes)[0],
          },
        ]);
      }
    } else if (decision.nextScene) {
      setStoryHistory((prev) => [
        ...prev,
        {
          chapterId: currentChapter,
          sceneId: decision.nextScene,
        },
      ]);
    }
  };

  return (
    <div
      className="max-w-full p-4 bg-gray-50 overflow-auto"
      style={{ maxHeight: 'calc(100vh - 2rem)' }}
    >
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Coffee className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
        </div>
        <div className="flex items-baseline gap-4 border-b border-gray-200 pb-2">
          <span className="text-xl font-light text-gray-600">
            Chapter {currentChapter.replace('chapter', '')}
          </span>
          <h2 className="text-lg text-gray-800">{chapter.title}</h2>
        </div>
      </header>

      <div className="space-y-4">
        {storyHistory.map((historyItem, index) => {
          const historyChapter = story.chapters[historyItem.chapterId];
          const historyScene = historyChapter.scenes[historyItem.sceneId];
          const isLatest = index === storyHistory.length - 1;

          return (
            <Scene
              key={`${historyItem.chapterId}-${historyItem.sceneId}-${index}`}
              scene={historyScene}
              showDecisions={isLatest}
              onDecision={handleDecision}
              chapter={historyItem.chapterId}
              chapters={story.chapters}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveStoryViewer;