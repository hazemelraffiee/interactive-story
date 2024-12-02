import React, { useState, useCallback, useEffect } from 'react';
import { 
  Save, Eye, Edit3, Share2, BookOpen, 
  AlertCircle, CheckCircle2, Loader, Menu, X,
  Upload, Download, ArrowLeft
} from 'lucide-react';
import storyService from '../../services/storyService';
import { useLocation, useNavigate } from 'react-router-dom';
import ChaptersManager from './ChaptersTreeDesigner';
import SceneContentEditor from './SceneContentEditor';
import InteractiveStoryViewer from './InteractiveStoryViewer';
import StoryGraphViewer from './StoryGraphViewer';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import NotificationToast from '../../components/common/NotificationToast';


const Sidebar = ({
  isOpen,
  setIsOpen,
  story,
  updateStory,
  availableGenres,
  onImport,
  onExport,
  selectedChapterId,
  onChapterSelect,
  onChapterCreate,
  onChapterUpdate,
  onChapterDelete,
}) => {
  return (
    <>
      <div
        className={`
          fixed inset-y-0 left-0 z-30
          w-[280px] md:w-[320px] bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative
        `}
      >
        <div className="flex flex-col h-full">
          {/* Story Title Input */}
          <div className="p-4 border-b border-gray-200 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={story.title}
                onChange={(e) => updateStory({ ...story, title: e.target.value })}
                placeholder="Story Title..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Import/Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onImport}
                className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Import Story
              </button>
              <button
                onClick={onExport}
                className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Export Story
              </button>
            </div>

            {/* Genre Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Story Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => {
                      const newGenres = story.genres?.includes(genre)
                        ? story.genres.filter(g => g !== genre)
                        : [...(story.genres || []), genre];
                      updateStory({ ...story, genres: newGenres });
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full
                      ${story.genres?.includes(genre)
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chapters Manager */}
          <div className="flex-1 overflow-y-auto">
            <ChaptersManager
              chapters={story.chapters || {}}
              selectedChapterId={selectedChapterId}
              onChapterSelect={onChapterSelect}
              onChapterCreate={onChapterCreate}
              onChapterUpdate={onChapterUpdate}
              onChapterDelete={onChapterDelete}
            />
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const ViewToggle = ({
  activeView,
  setActiveView,
  autoSaveEnabled,
  setAutoSaveEnabled,
  navigationViews
}) => (
  <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      {navigationViews.map((view) => (
        <button
          key={view.id}
          onClick={() => setActiveView(view.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors
            ${activeView === view.id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <view.icon className="w-4 h-4" />
          <span className="text-sm">{view.label}</span>
        </button>
      ))}
    </div>

    <div className="flex items-center gap-2 hidden sm:flex">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={autoSaveEnabled}
          onChange={(e) => setAutoSaveEnabled(e.target.checked)}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        <span className="ml-2 text-sm text-gray-600">Auto-save</span>
      </label>
    </div>
  </div>
);


// Helper component for displaying save status
const SaveStatus = ({ error, isSaving, isDirty, lastSaved }) => {
  if (error) return (
    <>
      <span className="text-red-500 flex items-center gap-1 text-sm hidden sm:flex">
        <AlertCircle className="w-4 h-4" />{error}
      </span>
      <span className="text-red-500 flex items-center text-sm sm:hidden">
        <AlertCircle className="w-4 h-4" />
      </span>
    </>
  );
  
  if (isSaving) return (
    <>
      <span className="text-gray-600 flex items-center gap-1 text-sm hidden sm:flex">
        <Loader className="w-4 h-4 animate-spin" />Saving changes...
      </span>
      <span className="text-gray-600 flex items-center text-sm sm:hidden">
        <Loader className="w-4 h-4 animate-spin" />
      </span>
    </>
  );
  
  if (isDirty) return (
    <>
      <span className="text-amber-500 flex items-center gap-1 text-sm hidden sm:flex">
        <AlertCircle className="w-4 h-4" />Unsaved changes
      </span>
      <span className="text-amber-500 flex items-center text-sm sm:hidden">
        <AlertCircle className="w-4 h-4" />
      </span>
    </>
  );
  
  if (lastSaved) return (
    <>
      <span className="text-green-600 flex items-center gap-1 text-sm hidden sm:flex">
        <CheckCircle2 className="w-4 h-4" />
        Saved {new Date(lastSaved).toLocaleTimeString()}
      </span>
      <span className="text-green-600 flex items-center text-sm sm:hidden">
        <CheckCircle2 className="w-4 h-4" />
      </span>
    </>
  );
  
  return null;
};

const StoryDesigner = () => {
  // Core state management
  const [story, setStory] = useState({ title: '', chapters: {} });
  
  // Selection state - we'll use simple IDs instead of objects
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  
  // UI state
  const [activeView, setActiveView] = useState('editor');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genres = await storyService.getGenres();
        setAvailableGenres(genres);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const loadStory = async () => {
      const storyId = location.state?.storyId;
      if (storyId) {
        try {
          setIsLoading(true);
          const loadedStory = await storyService.getStory(storyId);
          setStory(loadedStory);
          setCurrentStoryId(storyId);
          setLastSaved(new Date(loadedStory.updatedAt));
        } catch (error) {
          // Handle error
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    loadStory();
  }, [location.state?.storyId]);

  // Story modification handlers
  const handleStoryChange = useCallback((modifier) => {
    setStory(prevStory => modifier(prevStory));
    setIsDirty(true);  // Mark as dirty for any story changes
    setSaveError(null);
  }, []);

  // Selection handlers
  const handleChapterSelect = useCallback((chapterId) => {
    setSelectedChapterId(chapterId);
  }, []);

  const handleChapterUpdate = useCallback((chapterId, updates) => {
    handleStoryChange(prevStory => ({
      ...prevStory,
      chapters: {
        ...(prevStory.chapters || {}),
        [chapterId]: {
          ...prevStory.chapters[chapterId],
          ...updates
        }
      }
    }));
  }, [handleStoryChange]);

  const handleChapterDelete = useCallback((chapterId) => {
    handleStoryChange(prevStory => {
      const { [chapterId]: deleted, ...remainingChapters } = prevStory.chapters || {};
      return {
        ...prevStory,
        chapters: remainingChapters
      };
    });
    
    if (selectedChapterId === chapterId) {
      handleChapterSelect(null);
    }
  }, [selectedChapterId, handleChapterSelect, handleStoryChange]);

  const handleSceneUpdate = useCallback((chapterId, updatedScenes) => {
    setStory((prevStory) => ({
      ...prevStory,
      chapters: {
        ...prevStory.chapters,
        [chapterId]: {
          ...prevStory.chapters[chapterId],
          scenes: updatedScenes
        }
      }
    }));
    setIsDirty(true);
  }, []);

  // Navigation configuration for tabs/views
  const navigationViews = [
    { id: 'editor', icon: Edit3, label: 'Editor' },
    { id: 'preview', icon: Eye, label: 'Preview' },
    { id: 'graph', icon: Share2, label: 'Graph' }
  ];

  // Story update handler
  const updateStory = useCallback((newStory, skipDirty = false) => {
    setStory(newStory);
    if (!skipDirty) {
      setIsDirty(true);
      setSaveError(null);
    }
  }, []);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      try {
        const text = await file.text();
        const imported = yamlLoad(text);
        updateStory(imported);
        setLastSaved(null);
      } catch (error) {
        console.error('Failed to import story:', error);
        setSaveError('Failed to import story');
      }
    };
    input.click();
  };
  
  const handleExport = () => {
    try {
      const yamlString = yamlDump(story);
      const blob = new Blob([yamlString], { type: 'application/x-yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title.toLowerCase().replace(/\s+/g, '_')}.yaml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export story:', error);
      setSaveError('Failed to export story');
    }
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;
  
    setIsSaving(true);
    setSaveError(null);
  
    try {
      let savedStory;
      if (currentStoryId) {
        savedStory = await storyService.updateStory(currentStoryId, story);
      } else {
        savedStory = await storyService.createStory(story);
        setCurrentStoryId(savedStory._id);
      }
  
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save story:', error);
      setSaveError('Failed to save story');
    } finally {
      setIsSaving(false);
    }
  }, [story, isDirty, isSaving, currentStoryId]);

  const handleExit = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Do you want to save before leaving?');
      if (confirm) {
        handleSave().then(() => {
          navigate('/mystories');
        });
      } else {
        navigate('/mystories');
      }
    } else {
      navigate('/mystories');
    }
  }, [isDirty, handleSave, navigate]);

  const handleCreateChapter = useCallback(() => {
    const chapterId = `chapter${Object.keys(story.chapters || {}).length + 1}`;
    
    handleStoryChange(prevStory => ({
      ...prevStory,
      chapters: {
        ...(prevStory.chapters || {}),
        [chapterId]: {
          title: 'New Chapter',
          scenes: {}
        }
      }
    }));
    
    handleChapterSelect(chapterId);
    setActiveView('editor');
  }, [story, handleStoryChange, handleChapterSelect]);

  const handleCreateScene = useCallback((chapterId) => {
    if (!chapterId) return;
    
    const chapter = story.chapters[chapterId];
    if (!chapter) return;
  
    const sceneId = `scene${Object.keys(chapter.scenes || {}).length + 1}`;
    
    const newScene = {
      content: '',
      decisions: [],
      animation: 'fadeIn'
    };
  
    setStory(prevStory => ({
      ...prevStory,
      chapters: {
        ...prevStory.chapters,
        [chapterId]: {
          ...chapter,
          scenes: {
            ...chapter.scenes,
            [sceneId]: newScene    // sceneId is only used as the key
          }
        }
      }
    }));
    setIsDirty(true);
  }, [story]);

  useEffect(() => {
    if (!autoSaveEnabled || !isDirty || isSaving) return;
  
    const timeoutId = setTimeout(() => {
      handleSave();
    }, 2000); // Auto-save after 2 seconds of no changes
  
    return () => clearTimeout(timeoutId);
  }, [autoSaveEnabled, isDirty, isSaving, handleSave]);  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {notification && (
        <NotificationToast
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Top Bar - Persistent across all screen sizes */}
      <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 lg:hidden"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              {story.title || 'New Story'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to My Stories</span>
          </button>
          <SaveStatus
            error={saveError}
            isSaving={isSaving}
            isDirty={isDirty}
            lastSaved={lastSaved}
          />
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
              ${isDirty && !isSaving
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Save Changes</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Adapts based on screen size */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Navigation Panel - Full height on desktop, collapsible on mobile */}
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          story={story}
          updateStory={updateStory}
          availableGenres={availableGenres}
          onImport={handleImport}
          onExport={handleExport}
          selectedChapterId={selectedChapterId}
          onChapterSelect={setSelectedChapterId}
          onChapterCreate={handleCreateChapter}
          onChapterUpdate={handleChapterUpdate}
          onChapterDelete={handleChapterDelete}
        />

        {/* Content Area - Adapts between tabs and columns */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          {/* Main Editor Section */}
          <div className="flex-1 flex flex-col min-w-0 lg:border-r border-gray-200">
            {/* Mobile/Tablet Navigation */}
            <ViewToggle
              activeView={activeView}
              setActiveView={setActiveView}
              autoSaveEnabled={autoSaveEnabled}
              setAutoSaveEnabled={setAutoSaveEnabled}
              navigationViews={navigationViews}
            />

            {/* Content based on active view */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {activeView === 'editor' && selectedChapterId ? (
                  <SceneContentEditor
                    chapterId={selectedChapterId}
                    story={story}
                    onChange={handleSceneUpdate}
                    onCreateScene={() => handleCreateScene(selectedChapterId)}
                  />
                ) : activeView === 'preview' ? (
                  <div className="h-full overflow-auto p-4">
                    <InteractiveStoryViewer story={story} />
                  </div>
                ) : activeView === 'graph' ? (
                  <div className="h-full overflow-auto p-4">
                    <StoryGraphViewer story={story} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-6">
                    <div className="max-w-sm">
                      <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <Edit3 className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {Object.keys(story.chapters).length === 0 
                          ? 'Begin Your Creative Journey'
                          : 'No Chapter Selected'
                        }
                      </h3>
                      {Object.keys(story.chapters).length === 0 && (
                        <p className="text-gray-600 mb-6">
                          Every great story starts with a single chapter. Your imagination is the only limit - whether you're crafting an epic adventure, a heartwarming tale, or an intriguing mystery. Take that first step and bring your story to life.
                        </p>
                      )}
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleCreateChapter}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Create New Chapter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDesigner;