import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Eye, 
  LayoutTemplate,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Save,
  X
} from 'lucide-react';
import { Scene } from './InteractiveStoryViewer';
import SceneSelectorButton from './SceneSelectorButton';

const TAB_ICONS = {
  editor: Edit3,
  preview: Eye,
  both: LayoutTemplate  // Using the correct icon name
};

const TabButton = ({ active, id, label, onClick }) => {
  const IconComponent = TAB_ICONS[id];
  
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
        transition-colors duration-200
        ${active 
          ? 'bg-purple-100 text-purple-700' 
          : 'text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      {label}
    </button>
  );
};

const EditorPanel = ({ scene, onUpdate, story, onSceneCreate }) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Scene Content</h3>
      <textarea
        value={scene.content || ''}
        onChange={(e) => onUpdate('content', e.target.value)}
        className="w-full h-48 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Write your scene content here..."
      />
    </div>
    
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Decisions</h3>
        <button
          onClick={() => {
            const newDecisions = [...(scene.decisions || []), { text: '', nextScene: '' }];
            onUpdate('decisions', newDecisions);
          }}
          className="flex items-center gap-1 px-2 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-md"
        >
          <Plus className="w-4 h-4" />
          Add Decision
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {scene.decisions?.map((decision, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <input
              type="text"
              value={decision.text || ''}
              onChange={(e) => {
                const newDecisions = [...scene.decisions];
                newDecisions[index] = { ...decision, text: e.target.value };
                onUpdate('decisions', newDecisions);
              }}
              placeholder="Decision text..."
              className="w-full mb-2 px-3 py-1.5 text-sm border border-gray-200 rounded-md"
            />
            <div className="flex items-center gap-2 min-h-[38px]">
              <SceneSelectorButton
                story={story}
                currentValue={decision.nextScene}
                onChange={(newSceneId) => {
                  const newDecisions = [...scene.decisions];
                  newDecisions[index] = { ...decision, nextScene: newSceneId };
                  onUpdate('decisions', newDecisions);
                }}
                onSceneCreate={onSceneCreate}
              />
              <button
                onClick={() => {
                  const newDecisions = [...scene.decisions];
                  newDecisions.splice(index, 1);
                  onUpdate('decisions', newDecisions);
                }}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SceneAccordionItem = ({ 
  scene, 
  sceneId, 
  chapterId,
  story,
  isExpanded, 
  onToggle,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdateId,
  onCreateScene
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [isEditingId, setIsEditingId] = useState(false);
  const [newSceneId, setNewSceneId] = useState(sceneId);

  const handleSaveId = () => {
    if (newSceneId && newSceneId !== sceneId) {
      onUpdateId(sceneId, newSceneId);
    }
    setIsEditingId(false);
  };

  const tabs = [
    { id: 'editor', label: 'Editor' },
    { id: 'preview', label: 'Preview' },
    { id: 'both', label: 'Both' }
  ];

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
        <div className="flex-1 text-left">
          <h3 className="text-sm font-medium text-gray-900">
            {scene.title || `Scene ${sceneId}`}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {(scene.content?.split('\n')[0] || 'Empty scene').substring(0, 60)}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {scene.decisions?.length || 0} decisions
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {tabs.map(({ id, label }) => (
                <TabButton
                  key={id}
                  id={id}
                  active={activeTab === id}
                  label={label}
                  onClick={() => setActiveTab(id)}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              {isEditingId ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSceneId}
                    onChange={(e) => setNewSceneId(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-200 rounded-md w-32"
                    placeholder="New Scene ID"
                  />
                  <button
                    onClick={handleSaveId}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingId(false);
                      setNewSceneId(sceneId);
                    }}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditingId(true)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    ID: {sceneId}
                  </button>
                  <div className="h-6 w-px bg-gray-200" />
                  <button
                    onClick={onMoveUp}
                    title="Move scene up"
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onMoveDown}
                    title="Move scene down"
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this scene?')) {
                        onDelete(sceneId);
                      }
                    }}
                    title="Delete scene"
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'editor' && (
              <EditorPanel
                scene={scene}
                onUpdate={(field, value) => onUpdate(sceneId, field, value)}
                story={story}
                onSceneCreate={onCreateScene}
              />
            )}
            {activeTab === 'preview' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <Scene 
                  scene={scene} 
                  showDecisions={true}
                  chapter={chapterId}
                  chapters={story.chapters}
                />
              </div>
            )}
            {activeTab === 'both' && (
              <div className="grid grid-cols-2 gap-4">
                <EditorPanel
                  scene={scene}
                  onUpdate={(field, value) => onUpdate(sceneId, field, value)}
                  story={story}
                  onSceneCreate={onCreateScene}
                />
                <div className="bg-gray-50 rounded-lg p-4 overflow-y-auto">
                  <Scene 
                    scene={scene} 
                    showDecisions={true}
                    chapter={chapterId}
                    chapters={story.chapters}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const SceneContentEditor = ({ 
  chapterId,
  story,
  onChange,
  onCreateScene
}) => {
  const [expandedSceneId, setExpandedSceneId] = useState(null);
  
  const currentChapter = story.chapters?.[chapterId] || { title: '', scenes: {} };
  
  // Memoize the scenes object to maintain referential equality
  const scenes = useMemo(() => {
    return currentChapter.scenes || {};
  }, [currentChapter.scenes]);

  // Handler for updating scene content and properties
  const handleSceneUpdate = useCallback((sceneId, field, value) => {
    const updatedScenes = {
      ...scenes,
      [sceneId]: {
        ...scenes[sceneId],
        [field]: value
      }
    };
  
    onChange(chapterId, updatedScenes);
  }, [chapterId, scenes, onChange]);

  // Handler for deleting scenes
  const handleSceneDelete = useCallback((sceneId) => {
    const updatedScenes = { ...scenes };
    delete updatedScenes[sceneId];
  
    onChange(chapterId, updatedScenes);
  
    if (expandedSceneId === sceneId) {
      setExpandedSceneId(null);
    }
  }, [chapterId, scenes, onChange, expandedSceneId]);

  // Handler for moving scenes up or down in the list
  const handleSceneMove = useCallback((sceneId, direction) => {
    const sceneIds = Object.keys(scenes);
    const currentIndex = sceneIds.indexOf(sceneId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  
    if (newIndex < 0 || newIndex >= sceneIds.length) return;
  
    const updatedScenes = { ...scenes };
    const temp = updatedScenes[sceneIds[currentIndex]];
    updatedScenes[sceneIds[currentIndex]] = updatedScenes[sceneIds[newIndex]];
    updatedScenes[sceneIds[newIndex]] = temp;
  
    onChange(chapterId, updatedScenes);
  }, [chapterId, scenes, onChange]);

  // Handler for updating scene IDs
  const handleSceneIdUpdate = useCallback((oldId, newId) => {
    if (scenes[newId]) {
      alert('A scene with this ID already exists');
      return;
    }
  
    const updatedScenes = {};
    Object.entries(scenes).forEach(([id, scene]) => {
      if (id === oldId) {
        updatedScenes[newId] = scene;
      } else {
        updatedScenes[id] = scene;
      }
    });
  
    onChange(chapterId, updatedScenes);
  
    if (expandedSceneId === oldId) {
      setExpandedSceneId(newId);
    }
  }, [chapterId, scenes, onChange, expandedSceneId]);

  if (!chapterId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Chapter Selected</h3>
          <p className="mt-2 text-gray-500">Select a chapter to start editing scenes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-none bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentChapter.title || `Chapter ${chapterId}`}
            </h2>
            <p className="text-sm text-gray-500">
              {Object.keys(scenes).length} scenes
            </p>
          </div>
          <button
            onClick={() => onCreateScene(chapterId)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md"
          >
            <Plus className="w-4 h-4" />
            Add Scene
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(scenes).map(([sceneId, scene]) => (
          <SceneAccordionItem
            key={sceneId}
            scene={scene}
            sceneId={sceneId}
            chapterId={chapterId}
            story={story}
            isExpanded={expandedSceneId === sceneId}
            onToggle={() => setExpandedSceneId(expandedSceneId === sceneId ? null : sceneId)}
            onUpdate={handleSceneUpdate}
            onDelete={handleSceneDelete}
            onMoveUp={() => handleSceneMove(sceneId, 'up')}
            onMoveDown={() => handleSceneMove(sceneId, 'down')}
            onUpdateId={handleSceneIdUpdate}
            onCreateScene={onCreateScene}
          />
        ))}
      </div>
    </div>
  );
};

export default SceneContentEditor;