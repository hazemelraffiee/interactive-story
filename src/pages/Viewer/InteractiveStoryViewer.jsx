import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Coffee, MessageCircle, Brain, ArrowRight, AlertTriangle, Loader } from 'lucide-react';
import storyService from '../../services/storyService';

/**
 * Defines the animation keyframes used throughout the story viewer
 */
export const animationStyles = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  @keyframes slideInRight {
    0% { opacity: 0; transform: translateX(50px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  .animate-slideInRight {
    animation: slideInRight 0.5s ease-out forwards;
  }

  @keyframes earthquake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px) rotate(-1deg); }
    75% { transform: translateX(5px) rotate(1deg); }
  }
  .animate-earthquake {
    animation: earthquake 0.3s ease-in-out infinite;
  }
`;

const StoryTitle = ({ title }) => (
  <div className="mb-8">
    <div className="p-8 bg-white rounded-xl shadow-lg transition-all duration-500 hover:shadow-xl border border-purple-200 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-100/50 rounded-lg">
          <Coffee className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <div className="text-sm font-medium text-purple-600 mb-1">Interactive Story</div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>
    </div>
  </div>
);

const ChapterHeader = ({ title, chapterNumber }) => (
  <div className="mb-6">
    <div className="p-6 bg-white rounded-lg shadow-md transition-all duration-500 hover:shadow-lg border border-purple-200 animate-fadeIn">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center px-4 py-2 bg-purple-100/50 rounded-lg">
          <span className="text-sm font-medium text-purple-600">Chapter</span>
          <span className="text-2xl font-bold text-purple-700">{chapterNumber}</span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Parses raw text content into structured blocks for rendering
 * Supported formats:
 * - Dialogue: Starts with '>' (e.g., "> Character: Hello")
 * - Thought: Wrapped in asterisks (e.g., "*thinking to self*")
 * - Narrative: Any other text
 */
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

/**
 * Renders different types of content blocks based on their type
 */
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

/**
 * Parses a scene reference in the format "chapterId:sceneId"
 */
const parseSceneRef = (sceneRef) => {
  if (!sceneRef) return null;
  const [chapterId, sceneId] = sceneRef.split(':');
  return { chapterId, sceneId };
};

const DecisionButton = ({ decision, chapter, scenes, allChapters, chapters, onDecision, isSelected, historyIndex }) => {
  const nextSceneRef = parseSceneRef(decision.nextScene);
  const targetChapter = nextSceneRef?.chapterId || chapter;
  const targetScene = nextSceneRef?.sceneId || decision.nextScene;

  const isValidPath = decision.nextChapter
    ? allChapters.includes(decision.nextChapter)
    : targetScene && chapters[targetChapter]?.scenes &&
    Object.keys(chapters[targetChapter].scenes).includes(targetScene);

  const errorMessage = decision.nextChapter
    ? `Chapter "${decision.nextChapter}" not implemented`
    : `Scene "${targetScene}" not implemented in ${targetChapter}`;

  // Determine button appearance based on state
  const buttonStyle = isSelected
    ? 'bg-purple-100 border-2 border-purple-300'
    : isValidPath
      ? 'bg-gray-100 hover:bg-gray-200'
      : 'bg-red-50 border-2 border-red-200 cursor-not-allowed';

  const handleClick = () => {
    if (!isValidPath || isSelected) return;
    onDecision(historyIndex, decision);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full p-4 text-left rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:translate-x-1 ${buttonStyle}`}
      disabled={!isValidPath}
    >
      {isValidPath ? (
        isSelected ? (
          <div className="w-5 h-5 rounded-full bg-purple-500" />
        ) : (
          <ArrowRight className="w-5 h-5 text-gray-600" />
        )
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

export const Scene = ({ scene, chapter, chapters, historyIndex, onDecision, selectedDecision }) => {
  if (!scene) return null;
  const animationClass = scene.animation
    ? `animate-${scene.animation}`
    : 'animate-fadeIn';

  return (
    <div className={`mb-8 p-6 bg-white rounded-lg shadow-sm transition-all duration-500 hover:shadow-md ${animationClass}`}>
      <article className="prose prose-lg max-w-none">
        {parseContent(scene.content).map((item, index) => (
          <ContentBlock key={index} item={item} />
        ))}
      </article>

      {scene.decisions && (
        <div className="mt-8 space-y-4">
          {scene.decisions.map((decision, index) => (
            <DecisionButton
              key={index}
              decision={decision}
              chapter={chapter}
              scenes={Object.keys(chapters[chapter].scenes)}
              allChapters={Object.keys(chapters)}
              chapters={chapters}
              onDecision={onDecision}
              isSelected={selectedDecision && selectedDecision.text === decision.text}
              historyIndex={historyIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Main story viewer component that handles story progression and rendering
 */
const InteractiveStoryViewer = ({ story: propStory }) => {
  const [story, setStory] = useState(propStory);
  const [currentChapter, setCurrentChapter] = useState('');
  const [storyHistory, setStoryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { storyId } = useParams();
  const containerRef = useRef(null);
  const latestContentRef = useRef(null);

  // Function to handle selecting a different path from a previous point
  const handleHistoryBranch = (index, decision) => {
    // Keep all scenes up to and including the current scene where the decision was made
    const currentHistory = storyHistory.slice(0, index + 1);

    // Update the selected decision for the current scene
    currentHistory[index] = {
      ...currentHistory[index],
      selectedDecision: decision
    };

    if (decision.nextChapter) {
      const nextChapter = story.chapters[decision.nextChapter];
      if (nextChapter) {
        setCurrentChapter(decision.nextChapter);
        setStoryHistory([
          ...currentHistory,
          {
            chapterId: decision.nextChapter,
            sceneId: nextChapter.firstSceneId || Object.keys(nextChapter.scenes)[0],
            selectedDecision: null
          }
        ]);
      }
    } else if (decision.nextScene) {
      const nextSceneRef = parseSceneRef(decision.nextScene);
      const targetChapter = nextSceneRef?.chapterId || currentChapter;
      const targetScene = nextSceneRef?.sceneId || decision.nextScene;

      setCurrentChapter(targetChapter);
      setStoryHistory([
        ...currentHistory,
        {
          chapterId: targetChapter,
          sceneId: targetScene,
          selectedDecision: null
        }
      ]);
    }
  };

  useEffect(() => {
    const fetchStory = async () => {
      if (!propStory && storyId) {
        try {
          setIsLoading(true);
          const fetchedStory = await storyService.getStory(storyId);
          setStory(fetchedStory);
        } catch (error) {
          console.error('Error fetching story:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStory();
  }, [propStory, storyId]);

  useEffect(() => {
    if (latestContentRef.current && containerRef.current) {
      // Add a small delay to ensure content is rendered
      setTimeout(() => {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [storyHistory]);

  useEffect(() => {
    if (story && story.chapters && Object.keys(story.chapters).length > 0) {
      const firstChapterId = Object.keys(story.chapters)[0];
      const firstChapter = story.chapters[firstChapterId];
      const firstSceneId = firstChapter.firstSceneId || Object.keys(firstChapter.scenes)[0];

      setCurrentChapter(firstChapterId);
      setStoryHistory([
        {
          chapterId: firstChapterId,
          sceneId: firstSceneId
        }
      ]);
    }
  }, [story]);

  // First check loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  // Then check for missing story data
  if (!story || !story.title || !story.chapters || Object.keys(story.chapters).length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">No story to display. Please add chapters and scenes.</p>
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

  return (
    <div
      ref={containerRef}
      className="max-w-full p-4 bg-gray-50 overflow-auto"
      style={{ maxHeight: 'calc(100vh - 2rem)' }}
    >
      <StoryTitle title={story.title} />

      <div className="space-y-4 pb-16">
        {storyHistory.map((historyItem, index) => {
          const historyChapter = story.chapters[historyItem.chapterId];
          const historyScene = historyChapter.scenes[historyItem.sceneId];
          const isFirstSceneInChapter = index === 0 ||
            historyItem.chapterId !== storyHistory[index - 1].chapterId;

          return (
            <div
              key={`${historyItem.chapterId}-${historyItem.sceneId}-${index}`}
              ref={index === storyHistory.length - 1 ? latestContentRef : null}
            >
              {isFirstSceneInChapter && (
                <ChapterHeader
                  title={historyChapter.title}
                  chapterNumber={historyItem.chapterId.replace('chapter', '')}
                />
              )}
              <Scene
                scene={historyScene}
                chapter={historyItem.chapterId}
                chapters={story.chapters}
                historyIndex={index}
                onDecision={handleHistoryBranch}
                selectedDecision={historyItem.selectedDecision}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveStoryViewer;