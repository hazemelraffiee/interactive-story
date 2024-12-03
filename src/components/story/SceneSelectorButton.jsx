import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../layout/CustomDialog';

// Helper function to parse combined scene reference
const parseSceneRef = (sceneRef) => {
  if (!sceneRef) return null;
  const [chapterId, sceneId] = sceneRef.split(':');
  return { chapterId, sceneId };
};

// Helper function to create combined scene reference
const createSceneRef = (chapterId, sceneId) => {
  return `${chapterId}:${sceneId}`;
};

// Helper function to validate if a scene reference points to an existing scene
const isValidSceneRef = (sceneRef, story) => {
  const parsed = parseSceneRef(sceneRef);
  if (!parsed) return false;
  
  const { chapterId, sceneId } = parsed;
  return (
    story?.chapters?.[chapterId]?.scenes?.[sceneId] !== undefined
  );
};

const TriggerButton = ({ onClick, label, hasScene, story, sceneRef }) => {
  // Check both that we have a scene reference and that it points to a valid scene
  const isValid = hasScene && isValidSceneRef(sceneRef, story);
  
  return (
    <button 
      className={`w-full px-3 py-2 text-sm rounded-lg text-gray-900 font-medium
        ${isValid 
          ? "bg-white hover:bg-purple-50 ring-2 ring-purple-500" 
          : "bg-purple-50 ring-2 ring-purple-500 hover:bg-purple-100"}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
};

const NewSceneForm = ({ chapters, onSceneCreate, onCancel }) => {
  const [selectedChapter, setSelectedChapter] = useState(Object.keys(chapters)[0]);
  const [sceneId, setSceneId] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = () => {
    if (!sceneId.trim()) {
      alert('Please enter a scene ID');
      return;
    }
    
    // Check for duplicate scenes within the selected chapter
    if (chapters[selectedChapter]?.scenes?.[sceneId]) {
      alert('A scene with this ID already exists in this chapter');
      return;
    }

    onSceneCreate({
      chapterId: selectedChapter,
      sceneId: sceneId.trim(),
      sceneData: {
        content: content.trim(),
        decisions: []
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Chapter
        </label>
        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {Object.entries(chapters).map(([chapterId, chapter]) => (
            <option key={chapterId} value={chapterId}>
              {chapter.title || `Chapter ${chapterId}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scene ID
        </label>
        <input
          type="text"
          value={sceneId}
          onChange={(e) => setSceneId(e.target.value)}
          placeholder="Enter scene ID"
          className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Initial Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write the scene content..."
          rows={4}
          className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm text-gray-600 bg-white hover:bg-gray-50 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="px-3 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700"
        >
          Create Scene
        </button>
      </div>
    </div>
  );
};

const SceneList = ({ story, onSceneSelect }) => (
  <div className="space-y-2 max-h-96 overflow-y-auto">
    {Object.entries(story.chapters || {}).map(([chapterId, chapter]) => (
      <div key={chapterId} className="rounded border border-gray-200">
        <div className="px-3 py-2 bg-gray-50 text-gray-700 font-medium text-sm">
          {chapter.title || `Chapter ${chapterId}`}
        </div>
        <div className="p-2 space-y-1 bg-white">
          {Object.entries(chapter.scenes || {}).map(([sceneId, scene]) => (
            <button
              key={sceneId}
              onClick={() => onSceneSelect(createSceneRef(chapterId, sceneId))}
              className="w-full text-left p-2 text-sm text-gray-700 bg-white rounded hover:bg-gray-50"
            >
              Scene {sceneId}
              <div className="text-xs text-gray-500 truncate">
                {scene.content?.split('\n')[0] || 'Empty scene'}
              </div>
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const SceneSelectorButton = ({
  story,
  currentValue,
  onChange,
  onSceneCreate
}) => {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const currentScene = parseSceneRef(currentValue);

  const getSceneDisplayName = () => {
    if (!currentScene) return 'Select target scene';
    const targetChapter = story.chapters[currentScene.chapterId];
    if (!targetChapter) return 'Invalid scene reference';
    
    const targetScene = targetChapter.scenes[currentScene.sceneId];
    if (!targetScene) return 'Invalid scene reference';
    
    return `${targetChapter.title || `Chapter ${currentScene.chapterId}`} - Scene ${currentScene.sceneId}`;
  };

  const handleSceneCreate = (sceneData) => {
    onSceneCreate(sceneData);
    onChange(createSceneRef(sceneData.chapterId, sceneData.sceneId));
    setIsCreating(false);
    setOpen(false);
  };

  return (
    <>
      <div className="flex-1">
        <TriggerButton 
          onClick={() => setOpen(true)}
          label={getSceneDisplayName()}
          hasScene={currentScene !== null}
          story={story}
          sceneRef={currentValue}
        />
      </div>

      <Dialog 
        open={open} 
        onOpenChange={setOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-gray-900">Select Target Scene</DialogTitle>
            <DialogDescription className="text-gray-600">
              {isCreating ? 'Create a new scene' : 'Choose an existing scene or create a new one'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-white">
            {!isCreating ? (
              <>
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center justify-center gap-2 p-2 mb-4 text-sm text-purple-600 bg-white hover:bg-purple-50 rounded border-2 border-dashed border-purple-200"
                >
                  <Plus className="w-4 h-4" />
                  Create New Scene
                </button>
                <SceneList 
                  story={story}
                  onSceneSelect={(sceneRef) => {
                    onChange(sceneRef);
                    setOpen(false);
                  }}
                />
              </>
            ) : (
              <NewSceneForm
                chapters={story.chapters}
                onSceneCreate={handleSceneCreate}
                onCancel={() => setIsCreating(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SceneSelectorButton;