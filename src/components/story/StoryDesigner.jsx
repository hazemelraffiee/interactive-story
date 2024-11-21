import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save,
  Eye,
  Code,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader,
  FolderPlus,
  ChevronLeft,
  Menu,
  Upload,
  Download
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
  const [story, setStory] = useState({ title: '', chapters: {} });
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('editor');
  const [showCode, setShowCode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const SaveStatus = () => {
    if (saveError) return (
      <span className="text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />{saveError}
      </span>
    );
    if (isSaving) return (
      <span className="text-gray-600 flex items-center gap-1">
        <Loader className="w-4 h-4 animate-spin" />Saving...
      </span>
    );
    if (isDirty) return (
      <span className="text-amber-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />Unsaved changes
      </span>
    );
    if (lastSaved) return (
      <span className="text-green-600 flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4" />
        Saved {new Date(lastSaved).toLocaleTimeString()}
      </span>
    );
    return null;
  };

  const getCurrentTitle = () => {
    if (selected?.type === 'scene') {
      return story.chapters[selected.chapterId]?.scenes[selected.sceneId]?.id || 'Edit Scene';
    }
    return selected?.chapterId ? story.chapters[selected.chapterId]?.title || 'Edit Chapter' : 'Story Designer';
  };

  useEffect(() => {
    if (isDirty && autoSaveEnabled) {
      const timeoutId = setTimeout(handleSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [story, isDirty, autoSaveEnabled, handleSave]);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:relative
        inset-y-0 left-0
        w-72 z-30
        flex flex-col
        bg-white border-r border-gray-200
        transition-transform duration-300
      `}>
        {/* Mobile Close Button */}
        <div className="md:hidden flex items-center h-16 px-4 border-b border-gray-200">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="ml-2 font-semibold">Story Structure</span>
        </div>

        {/* Story Title Input */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex-1 flex items-center min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {getCurrentTitle()}
            </h1>
          </div>

          {/* Auto Save */}
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

          {/* Import / Export */}
          <div className="flex items-center gap-2">
            <label className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="text-sm">Import</span>
              <input type="file" hidden accept=".yaml,.yml" onChange={handleImport} />
            </label>
            <button 
              onClick={handleExport}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setView('editor');
                setShowCode(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                view === 'editor' && !showCode
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Editor</span>
            </button>
            <button
              onClick={() => {
                setView('preview');
                setShowCode(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                view === 'preview' && !showCode
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Preview</span>
            </button>
            <button
              onClick={() => setShowCode(!showCode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                showCode
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Code</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <SaveStatus />
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <button 
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
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

        {/* Content Area */}
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
            <div className="p-4 sm:p-6">
              <SceneEditor
                scene={story.chapters[selected.chapterId]?.scenes[selected.sceneId]}
                chapterId={selected.chapterId}
                sceneId={selected.sceneId}
                onChange={handleSceneUpdate}
              />
            </div>
          ) : view === 'preview' ? (
            <div className="p-4 sm:p-6">
              <InteractiveStoryViewer story={story} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center p-4">
                <FolderPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Scene Selected</h3>
                <p className="text-gray-500">Select a scene from the chapter tree to start editing</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Action Bar */}
        <div className="md:hidden flex items-center justify-between gap-2 p-4 border-t border-gray-200 bg-white">
          <SaveStatus />
          <button 
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
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
  );
};

export default StoryDesigner;
