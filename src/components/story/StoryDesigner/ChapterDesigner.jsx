import React from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Card,
  CardHeader,
  CardContent,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Button,
  Collapse,
} from '@mui/material';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

const SceneItem = ({
  scene,
  chapterId,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddDecision,
  onUpdateDecision,
  onDeleteDecision,
  availableScenes
}) => (
  <div className="bg-white rounded-lg shadow mb-4 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <input
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={scene.id}
          onChange={(e) => onUpdate(chapterId, scene.id, 'id', e.target.value)}
        />
        <button
          onClick={() => onDelete(chapterId, scene.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <select
            value={scene.animation}
            onChange={(e) => onUpdate(chapterId, scene.id, 'animation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="fadeIn">Fade In</option>
            <option value="slideInRight">Slide In Right</option>
            <option value="earthquake">Earthquake</option>
          </select>

          <textarea
            rows={4}
            value={scene.content}
            onChange={(e) => onUpdate(chapterId, scene.id, 'content', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter scene content... Use '>' for dialogue and '*' for thoughts"
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Decisions</span>
              <button
                onClick={() => onAddDecision(chapterId, scene.id)}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-1"
              >
                + Add Decision
              </button>
            </div>

            <div className="space-y-2">
              {scene.decisions.map((decision, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg"
                >
                  <input
                    value={decision.text}
                    onChange={(e) => onUpdateDecision(chapterId, scene.id, index, 'text', e.target.value)}
                    placeholder="What should the player decide?"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <select
                    value={decision.nextScene || ''}
                    onChange={(e) => onUpdateDecision(chapterId, scene.id, index, 'nextScene', e.target.value)}
                    className="min-w-[150px] px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select next scene</option>
                    {availableScenes.map((sceneId) => (
                      <option key={sceneId} value={sceneId}>
                        {sceneId}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onDeleteDecision(chapterId, scene.id, index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const ChapterDesigner = ({
  chapter,
  chapterId,
  isExpanded,
  expandedSceneId,
  onToggle,
  onToggleScene,
  onUpdateChapter,
  onUpdateScene,
  onDeleteScene,
  onAddScene,
  onAddDecision,
  onUpdateDecision,
  onDeleteDecision,
  onDeleteChapter,
}) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      {/* Chapter Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={onToggle}
              className="p-1 hover:bg-white/50 rounded-full"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <input
              value={chapter.title}
              onChange={(e) => onUpdateChapter(chapterId, 'title', e.target.value)}
              className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 px-2 py-1 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddScene(chapterId)}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-full hover:bg-purple-700 flex items-center gap-1"
            >
              <Plus size={16} />
              Add Scene
            </button>
            <button
              onClick={() => onDeleteChapter(chapterId)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      {isExpanded && (
        <div className="p-4">
          <select
            value={chapter.firstSceneId}
            onChange={(e) => onUpdateChapter(chapterId, 'firstSceneId', e.target.value)}
            className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select first scene</option>
            {Object.keys(chapter.scenes).map((sceneId) => (
              <option key={sceneId} value={sceneId}>
                {sceneId}
              </option>
            ))}
          </select>

          {/* Scenes */}
          <div className="space-y-4">
            {Object.entries(chapter.scenes).map(([sceneId, scene]) => (
              <SceneItem
                key={sceneId}
                scene={scene}
                chapterId={chapterId}
                isExpanded={expandedSceneId === sceneId}
                onToggle={() => onToggleScene(expandedSceneId === sceneId ? null : sceneId)}
                onUpdate={onUpdateScene}
                onDelete={onDeleteScene}
                onAddDecision={onAddDecision}
                onUpdateDecision={onUpdateDecision}
                onDeleteDecision={onDeleteDecision}
                availableScenes={Object.keys(chapter.scenes)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterDesigner;