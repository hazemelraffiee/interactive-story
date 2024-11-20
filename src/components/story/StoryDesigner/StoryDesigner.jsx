import React, { useState } from 'react';
import {
  Box,
  Alert,
} from '@mui/material';
import InteractiveStoryViewer from '../InteractiveStoryViewer';
import { LAYOUT_TYPES } from './LayoutSettings';
import ChapterDesigner from './ChapterDesigner';
import {
  Book,
  Layout,
  Play,
  Plus,
  Upload,
  Save
} from 'lucide-react';

import { dump as yamlDump, load as yamlLoad } from 'js-yaml';

const StoryDesigner = () => {
  const [layoutType, setLayoutType] = useState(() => {
    const saved = localStorage.getItem('storyDesignerLayout');
    return saved || LAYOUT_TYPES.SPLIT;
  });
  const [activeTab, setActiveTab] = useState('editor');
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [expandedScene, setExpandedScene] = useState(null);
  const [isLayoutSettingsOpen, setIsLayoutSettingsOpen] = useState(false);
  const [story, setStory] = useState({ title: '', chapters: {} });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleAddChapter = () => {
    const chapterId = `chapter${Object.keys(story.chapters).length + 1}`;
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          id: chapterId,
          title: `New Chapter ${Object.keys(prev.chapters).length + 1}`,
          firstSceneId: 'scene1',
          scenes: {
            scene1: {
              id: 'scene1',
              animation: 'fadeIn',
              content: '',
              decisions: [],
            },
          },
        },
      },
    }));
    setExpandedChapter(chapterId);
  };

  const handleUpdateChapter = (chapterId, field, value) => {
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          [field]: value,
        },
      },
    }));
  };

  const handleUpdateScene = (chapterId, sceneId, field, value) => {
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          scenes: {
            ...prev.chapters[chapterId].scenes,
            [sceneId]: {
              ...prev.chapters[chapterId].scenes[sceneId],
              [field]: value,
            },
          },
        },
      },
    }));
  };

  const handleAddScene = (chapterId) => {
    const sceneNumber = Object.keys(story.chapters[chapterId].scenes).length + 1;
    const sceneId = `scene${sceneNumber}`;
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          scenes: {
            ...prev.chapters[chapterId].scenes,
            [sceneId]: {
              id: sceneId,
              animation: 'fadeIn',
              content: '',
              decisions: [],
            },
          },
        },
      },
    }));
  };

  const handleDeleteScene = (chapterId, sceneId) => {
    if (window.confirm('Are you sure you want to delete this scene?')) {
      setStory((prev) => {
        const newChapter = { ...prev.chapters[chapterId] };
        const newScenes = { ...newChapter.scenes };
        delete newScenes[sceneId];
        newChapter.scenes = newScenes;
        return {
          ...prev,
          chapters: {
            ...prev.chapters,
            [chapterId]: newChapter,
          },
        };
      });
    }
  };

  const handleDeleteChapter = (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      setStory((prev) => {
        const newChapters = { ...prev.chapters };
        delete newChapters[chapterId];
        return { ...prev, chapters: newChapters };
      });
    }
  };

  const handleAddDecision = (chapterId, sceneId) => {
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          scenes: {
            ...prev.chapters[chapterId].scenes,
            [sceneId]: {
              ...prev.chapters[chapterId].scenes[sceneId],
              decisions: [
                ...prev.chapters[chapterId].scenes[sceneId].decisions,
                { text: '', nextScene: '' },
              ],
            },
          },
        },
      },
    }));
  };

  const handleUpdateDecision = (chapterId, sceneId, index, field, value) => {
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          scenes: {
            ...prev.chapters[chapterId].scenes,
            [sceneId]: {
              ...prev.chapters[chapterId].scenes[sceneId],
              decisions: prev.chapters[chapterId].scenes[sceneId].decisions.map(
                (decision, i) => (i === index ? { ...decision, [field]: value } : decision)
              ),
            },
          },
        },
      },
    }));
  };

  const handleDeleteDecision = (chapterId, sceneId, index) => {
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          scenes: {
            ...prev.chapters[chapterId].scenes,
            [sceneId]: {
              ...prev.chapters[chapterId].scenes[sceneId],
              decisions: prev.chapters[chapterId].scenes[sceneId].decisions.filter(
                (_, i) => i !== index
              ),
            },
          },
        },
      },
    }));
  };

  // Handle Export Story
  const handleExportStory = () => {
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
      setSnackbar({
        open: true,
        message: 'Story exported successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export story',
        severity: 'error',
      });
    }
  };

  // Handle Import Story
  const handleImportStory = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedStory = yamlLoad(e.target.result);
        setStory(importedStory);
        setExpandedChapter(null);
        setExpandedScene(null);
        setSnackbar({
          open: true,
          message: 'Story imported successfully',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to import story',
          severity: 'error',
        });
      }
    };
    reader.readAsText(file);
  };

  const renderEditor = () => (
    <Box sx={{ p: 3, overflow: 'auto', height: 'calc(100vh - 72px)' }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Pro tip: Use '&gt;' for dialogue (e.g. "&gt; John: Hello!") and '*' for thoughts
      </Alert>

      {Object.entries(story.chapters).map(([chapterId, chapter]) => (
        <ChapterDesigner
          key={chapterId}
          chapter={chapter}
          chapterId={chapterId}
          isExpanded={expandedChapter === chapterId}
          expandedSceneId={expandedScene}
          onToggle={() => setExpandedChapter(expandedChapter === chapterId ? null : chapterId)}
          onToggleScene={setExpandedScene}
          onUpdateChapter={handleUpdateChapter}
          onUpdateScene={handleUpdateScene}
          onDeleteScene={handleDeleteScene}
          onAddScene={handleAddScene}
          onAddDecision={handleAddDecision}
          onUpdateDecision={handleUpdateDecision}
          onDeleteDecision={handleDeleteDecision}
          onDeleteChapter={handleDeleteChapter}
        />
      ))}
    </Box>
  );

  const renderChapter = (chapterId, chapter) => (
    <ChapterDesigner
      key={chapterId}
      chapter={chapter}
      chapterId={chapterId}
      isExpanded={expandedChapter === chapterId}
      expandedSceneId={expandedScene}
      onToggle={() => setExpandedChapter(expandedChapter === chapterId ? null : chapterId)}
      onToggleScene={setExpandedScene}
      onUpdateChapter={handleUpdateChapter}
      onUpdateScene={handleUpdateScene}
      onDeleteScene={handleDeleteScene}
      onAddScene={handleAddScene}
      onAddDecision={handleAddDecision}
      onUpdateDecision={handleUpdateDecision}
      onDeleteDecision={handleDeleteDecision}
      onDeleteChapter={handleDeleteChapter}
    />
  );

  const renderPreview = () => (
    <InteractiveStoryViewer story={story} />
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4">
          <button
            onClick={() => setActiveTab('editor')}
            className={`p-3 rounded-xl transition-colors ${
              activeTab === 'editor' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <Book className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`p-3 rounded-xl transition-colors ${
              activeTab === 'preview'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <Play className="w-6 h-6" />
          </button>
          <button
            onClick={() => setLayoutType(layoutType === 'split' ? 'tab' : 'split')}
            className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl mt-auto"
          >
            <Layout className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Header */}
          <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={story.title}
                onChange={(e) => setStory(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter story title..."
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  hidden
                  accept=".yaml,.yml"
                  onChange={handleImportStory}
                />
              </label>
              <button 
                onClick={handleExportStory}
                disabled={!story.title}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={handleAddChapter}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Chapter
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'editor' ? renderEditor() : renderPreview()}
          </div>
        </div>
      </div>

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-2">
          <span className={`text-sm ${
            snackbar.severity === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {snackbar.message}
          </span>
          <button
            onClick={() => setSnackbar({ ...snackbar, open: false })}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryDesigner;