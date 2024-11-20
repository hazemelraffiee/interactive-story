import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save,
  Upload,
  Download,
  Eye,
  Code,
  Trash2,
  ChevronRight,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader,
  FolderPlus
} from 'lucide-react';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import InteractiveStoryViewer from './InteractiveStoryViewer';
import Editor from '@monaco-editor/react';
import SceneContentEditor from './SceneContentEditor';
import ChaptersTreeDesigner from './ChaptersTreeDesigner';

// Scene Editor Component
const SceneEditor = ({ scene, chapterId, sceneId, onChange }) => {
  if (!scene) return null;
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Scene ID</label>
          <input
            type="text"
            value={scene.id}
            onChange={(e) => onChange(chapterId, sceneId, 'id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Animation</label>
          <select
            value={scene.animation}
            onChange={(e) => onChange(chapterId, sceneId, 'animation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="fadeIn">Fade In</option>
            <option value="slideInRight">Slide In Right</option>
            <option value="earthquake">Earthquake</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <SceneContentEditor 
          value={scene.content} 
          onChange={(newContent) => onChange(chapterId, sceneId, 'content', newContent)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Decisions</label>
          <button 
            onClick={() => onChange(chapterId, sceneId, 'decisions', [...(scene.decisions || []), { text: '', nextScene: '' }])}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            + Add Decision
          </button>
        </div>
        <div className="space-y-3">
          {scene.decisions?.map((decision, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  placeholder="Decision text..."
                  value={decision.text}
                  onChange={(e) => {
                    const newDecisions = [...scene.decisions];
                    newDecisions[index] = { ...decision, text: e.target.value };
                    onChange(chapterId, sceneId, 'decisions', newDecisions);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="w-48">
                <input
                  placeholder="Next scene ID..."
                  value={decision.nextScene || ''}
                  onChange={(e) => {
                    const newDecisions = [...scene.decisions];
                    newDecisions[index] = { ...decision, nextScene: e.target.value };
                    onChange(chapterId, sceneId, 'decisions', newDecisions);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => {
                  const newDecisions = scene.decisions.filter((_, i) => i !== index);
                  onChange(chapterId, sceneId, 'decisions', newDecisions);
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Story Designer Component
const StoryDesigner = () => {
  const [story, setStory] = useState({
    title: '',
    chapters: {}
  });
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('editor');
  const [showCode, setShowCode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Load story from localStorage on mount
  useEffect(() => {
    const loadStory = () => {
      const savedStory = localStorage.getItem('currentStory');
      if (savedStory) {
        try {
          const parsed = JSON.parse(savedStory);
          setStory(parsed);
          setLastSaved(new Date());
          setIsDirty(false);
          setSaveError(null);
        } catch (error) {
          console.error('Failed to load story from localStorage:', error);
          setSaveError('Failed to load saved story');
        }
      }
    };

    loadStory();
  }, []);

  // Update story with dirty state tracking
  const updateStory = useCallback((newStory, skipDirty = false) => {
    setStory(newStory);
    if (!skipDirty) {
      setIsDirty(true);
      setSaveError(null);
    }
  }, []);

  // Save to localStorage with error handling
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

  // Auto-save when story changes
  useEffect(() => {
    if (isDirty && autoSaveEnabled) {
      const timeoutId = setTimeout(handleSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [story, isDirty, autoSaveEnabled, handleSave]);

  // Scene update handler with proper dirty state tracking
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

      // Only mark as dirty if the value actually changed
      const oldValue = prev.chapters[chapterId].scenes[sceneId][field];
      if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  // File import with proper state management
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = yamlLoad(text);
      updateStory(imported);
      setLastSaved(null); // Reset last saved as this is a new story
    } catch (error) {
      console.error('Failed to import story:', error);
      setSaveError('Failed to import story');
    }
  };

  // Export with error handling
  const handleExport = () => {
    try {
      const yamlString = yamlDump(story);
      const blob = new Blob([yamlString], { type: 'application/x-yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title.toLowerCase().replace(/\s+/g, '_')}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export story:', error);
      setSaveError('Failed to export story');
    }
  };

  // Toolbar status component
  const SaveStatus = () => {
    if (saveError) {
      return (
        <span className="text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {saveError}
        </span>
      );
    }

    if (isSaving) {
      return (
        <span className="text-gray-600 flex items-center gap-1">
          <Loader className="w-4 h-4 animate-spin" />
          Saving...
        </span>
      );
    }

    if (isDirty) {
      return (
        <span className="text-amber-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Unsaved changes
        </span>
      );
    }

    if (lastSaved) {
      return (
        <span className="text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          Saved {new Date(lastSaved).toLocaleTimeString()}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Story Structure */}
      <div className="w-72 flex flex-col border-r border-gray-200 bg-white">
        {/* Story Title and Meta */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Title</label>
            <input
              type="text"
              value={story.title}
              onChange={(e) => updateStory({ ...story, title: e.target.value })}
              placeholder="Enter story title..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {Object.keys(story.chapters).length} chapters
            </span>
            <span className="text-gray-500">
              {Object.values(story.chapters).reduce((acc, chapter) => 
                acc + Object.keys(chapter.scenes || {}).length, 0
              )} total scenes
            </span>
          </div>
        </div>

        {/* Chapters Tree */}
        <div className="flex-1 overflow-y-auto">
          <ChaptersTreeDesigner
            story={story}
            selectedId={selected?.chapterId}
            onStoryChange={updateStory}
            onSelect={setSelected}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Left Section - View Controls */}
          <div className="flex items-center space-x-4">
            {/* View Mode Selector */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setView('editor');
                  setShowCode(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  view === 'editor' && !showCode
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span className="text-sm">Editor</span>
              </button>
              <button
                onClick={() => {
                  setView('preview');
                  setShowCode(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  view === 'preview' && !showCode
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Preview</span>
              </button>
              <button
                onClick={() => setShowCode(!showCode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  showCode
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-4 h-4" />
                <span className="text-sm">Code</span>
              </button>
            </div>

            {/* Current Path */}
            {selected && (
              <div className="flex items-center text-sm text-gray-600">
                <span>{story.title}</span>
                <ChevronRight className="w-4 h-4 mx-1" />
                <span>{story.chapters[selected.chapterId]?.title || selected.chapterId}</span>
                {selected.sceneId && (
                  <>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <span>{selected.sceneId}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            {/* Save Status */}
            <div className="flex items-center gap-1 text-sm border-r border-gray-200 pr-3">
              <SaveStatus />
            </div>

            {/* Auto-save Toggle */}
            <div className="flex items-center gap-2 border-r border-gray-200 pr-3">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                <span className="ml-2 text-sm text-gray-600">Auto-save</span>
              </label>
            </div>

            {/* Import/Export/Save */}
            <div className="flex items-center gap-2">
              <label className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm">Import</span>
                <input type="file" hidden accept=".yaml,.yml" onChange={handleImport} />
              </label>
              <button 
                onClick={handleExport}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isDirty && !isSaving
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor/Preview/Code Area */}
        <div className="flex-1 overflow-y-auto">
          {showCode ? (
            <div className="h-full">
              <Editor
                defaultLanguage="yaml"
                value={yamlDump(story)}
                onChange={(value) => {
                  try {
                    const parsed = yamlLoad(value);
                    updateStory(parsed);
                  } catch (error) {
                    // Handle parse error if needed
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
                }}
              />
            </div>
          ) : view === 'editor' && selected?.type === 'scene' ? (
            <div className="p-6">
              <SceneEditor
                scene={story.chapters[selected.chapterId]?.scenes[selected.sceneId]}
                chapterId={selected.chapterId}
                sceneId={selected.sceneId}
                onChange={handleSceneUpdate}
              />
            </div>
          ) : view === 'preview' ? (
            <div className="p-6">
              <InteractiveStoryViewer story={story} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FolderPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Scene Selected</h3>
                <p className="text-gray-500">
                  Select a scene from the chapter tree to start editing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDesigner;