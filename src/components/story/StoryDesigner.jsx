import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, Eye, Code, Edit3, CheckCircle2, 
  AlertCircle, Loader, Menu, Upload, Download,
  X, LayoutGrid, BookOpen, Plus, Share2
} from 'lucide-react';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import Editor from '@monaco-editor/react';
import InteractiveStoryViewer from './InteractiveStoryViewer';
import SceneContentEditor from './SceneContentEditor';
import ChaptersTreeDesigner from './ChaptersTreeDesigner';
import StoryGraphViewer from './StoryGraphViewer';

const TopBar = ({ 
  title, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  saveStatus, 
  onSave, 
  isDirty,
  isSaving 
}) => (
  <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
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
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <div className="hidden sm:block">
        {saveStatus}
      </div>
      <button 
        onClick={onSave}
        disabled={!isDirty || isSaving}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
          isDirty && !isSaving
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span className="hidden sm:inline">Save Changes</span>
      </button>
    </div>
  </div>
);

const ViewToggle = ({ 
  view, 
  showCode, 
  setView, 
  setShowCode,
  autoSaveEnabled,
  setAutoSaveEnabled
}) => (
  <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => { setView('editor'); setShowCode(false); }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
          view === 'editor' && !showCode ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Edit3 className="w-4 h-4" />
        <span className="text-sm">Editor</span>
      </button>
      <button
        onClick={() => setShowCode(!showCode)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
          showCode ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Code className="w-4 h-4" />
        <span className="text-sm">Code</span>
      </button>
      <button
        onClick={() => { setView('preview'); setShowCode(false); }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
          view === 'preview' && !showCode ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm">Preview</span>
      </button>
      <button
        onClick={() => { setView('graph'); setShowCode(false); }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
          view === 'graph' && !showCode ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm">Graph</span>
      </button>
    </div>

    {/* Auto-save toggle */}
    <div className="flex items-center gap-2">
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

const Sidebar = ({ 
  isOpen, 
  setIsOpen,
  story, 
  updateStory, 
  selected, 
  setSelected,
  onImport,
  onExport 
}) => (
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
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={story.title}
              onChange={(e) => updateStory({ ...story, title: e.target.value })}
              placeholder="Story Title..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onImport}
              className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Import Story
            </button>
            <button 
              onClick={onExport}
              className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Export Story
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ChaptersTreeDesigner
            story={story}
            selectedId={selected?.chapterId}
            onStoryChange={updateStory}
            onSelect={setSelected}
          />
        </div>
      </div>

      {/* Mobile close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        aria-label="Close sidebar"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>

    {/* Mobile overlay */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black/30 z-20 lg:hidden"
        onClick={() => setIsOpen(false)}
      />
    )}
  </>
);

const SaveStatus = ({ error, isSaving, isDirty, lastSaved }) => {
  if (error) return (
    <span className="text-red-500 flex items-center gap-1 text-sm">
      <AlertCircle className="w-4 h-4" />{error}
    </span>
  );
  if (isSaving) return (
    <span className="text-gray-600 flex items-center gap-1 text-sm">
      <Loader className="w-4 h-4 animate-spin" />Saving...
    </span>
  );
  if (isDirty) return (
    <span className="text-amber-500 flex items-center gap-1 text-sm font-medium">
      <AlertCircle className="w-4 h-4" />Unsaved changes
    </span>
  );
  if (lastSaved) return (
    <span className="text-green-600 flex items-center gap-1 text-sm">
      <CheckCircle2 className="w-4 h-4" />
      Saved {new Date(lastSaved).toLocaleTimeString()}
    </span>
  );
  return null;
};

const EmptyState = ({ onCreateScene }) => (
  <div className="h-full flex items-center justify-center text-center p-6">
    <div className="max-w-sm">
      <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
        <LayoutGrid className="w-8 h-8 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scene Selected</h3>
      <p className="text-gray-600 mb-6">Select a scene from the sidebar to start editing your interactive story</p>
      <button 
        onClick={onCreateScene} 
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create New Scene
      </button>
    </div>
  </div>
);

const StoryDesigner = () => {
  const [story, setStory] = useState({ title: '', chapters: {} });
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('editor');
  const [showCode, setShowCode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const updateStory = useCallback((newStory, skipDirty = false) => {
    setStory(newStory);
    if (!skipDirty) {
      setIsDirty(true);
      setSaveError(null);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      localStorage.setItem('currentStory', JSON.stringify(story));
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save story:', error);
      setSaveError('Failed to save story');
    } finally {
      setIsSaving(false);
    }
  }, [story, isDirty, isSaving]);

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

  const handleSceneUpdate = useCallback((chapterId, sceneId, field, value) => {
    setStory(prev => {
      const updated = {
        ...prev,
        chapters: {
          ...prev.chapters,
          [chapterId]: {
            ...prev.chapters[chapterId],
            scenes: {
              ...prev.chapters[chapterId].scenes,
              [sceneId]: {
                ...prev.chapters[chapterId].scenes[sceneId],
                [field]: value
              }
            }
          }
        }
      };
      setIsDirty(true);
      return updated;
    });
  }, []);

  const getCurrentTitle = useCallback(() => {
    if (selected?.type === 'scene') {
      return story.chapters[selected.chapterId]?.scenes[selected.sceneId]?.id || 'Edit Scene';
    }
    return selected?.chapterId ? story.chapters[selected.chapterId]?.title || 'Edit Chapter' : 'Story Designer';
  }, [selected, story.chapters]);

  const handleCreateScene = useCallback((chapterId = Object.keys(story.chapters)[0]) => {
    if (!chapterId) return;
    
    const chapter = story.chapters[chapterId];
    if (!chapter) return;

    const newSceneId = `scene${Object.keys(chapter.scenes || {}).length + 1}`;
    
    updateStory({
      ...story,
      chapters: {
        ...story.chapters,
        [chapterId]: {
          ...chapter,
          scenes: {
            ...chapter.scenes,
            [newSceneId]: {
              id: newSceneId,
              content: '',
              decisions: [],
              animation: 'fadeIn'
            }
          }
        }
      }
    });

    setSelected({
      type: 'scene',
      chapterId,
      sceneId: newSceneId
    });
    // You can add this functionality as needed
  }, [story, updateStory]);

  // Load initial story from localStorage
  useEffect(() => {
    try {
      const savedStory = localStorage.getItem('currentStory');
      if (savedStory) {
        const parsed = JSON.parse(savedStory);
        setStory(parsed);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to load story:', error);
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty || isSaving) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 2000); // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [autoSaveEnabled, isDirty, isSaving, handleSave]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          story={story}
          updateStory={updateStory}
          selected={selected}
          setSelected={setSelected}
          onImport={handleImport}
          onExport={handleExport}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar 
            title={getCurrentTitle()}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            saveStatus={
              <SaveStatus 
                error={saveError}
                isSaving={isSaving}
                isDirty={isDirty}
                lastSaved={lastSaved}
              />
            }
            onSave={handleSave}
            isDirty={isDirty}
            isSaving={isSaving}
          />
          
          <ViewToggle 
            view={view}
            showCode={showCode}
            setView={setView}
            setShowCode={setShowCode}
            autoSaveEnabled={autoSaveEnabled}
            setAutoSaveEnabled={setAutoSaveEnabled}
          />
          
          <div className="flex-1 overflow-hidden">
            {showCode ? (
              <Editor
                defaultLanguage="yaml"
                value={yamlDump(story)}
                onChange={(value) => {
                  try {
                    const parsed = yamlLoad(value);
                    updateStory(parsed);
                  } catch (error) {
                    console.error('Parse error:', error);
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  wrappingIndent: 'indent',
                  tabSize: 2,
                  theme: 'vs-light'
                }}
                className="h-full w-full"
              />
            ) : view === 'editor' && selected?.type === 'scene' ? (
              <div className="h-full">
                <SceneContentEditor
                  scene={story.chapters[selected.chapterId]?.scenes[selected.sceneId]}
                  chapterId={selected.chapterId}
                  sceneId={selected.sceneId}
                  onChange={handleSceneUpdate}
                  story={story}
                  onCreateScene={handleCreateScene}
                  onCreateChapter={() => {}}
                />
              </div>
            ) : view === 'preview' ? (
              <div className="h-full overflow-auto">
                <div className="max-w-4xl mx-auto px-4 py-6 md:p-6">
                  <InteractiveStoryViewer story={story} />
                </div>
              </div>
            ) : view === 'graph' ? (
              <div className="h-full overflow-auto">
                <div className="max-w-4xl mx-auto px-4 py-6 md:p-6">
                  <StoryGraphViewer story={story} />
                </div>
              </div>
            ) : (
              <div className="h-full">
                <EmptyState onCreateScene={handleCreateScene} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDesigner;