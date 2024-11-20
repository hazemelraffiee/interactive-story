import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FolderPlus
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableChapterItem = ({
  id,
  chapter,
  isExpanded,
  isEditing,
  isSelected,
  onToggleExpand,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onChange,
  onSelect
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${isSelected ? 'bg-purple-50' : ''}`}>
      <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="opacity-0 group-hover:opacity-100 cursor-grab">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Expand/Collapse */}
        <button 
          onClick={onToggleExpand}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Chapter Title */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={chapter.title}
              onChange={e => onChange(id, { ...chapter, title: e.target.value })}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Chapter title..."
              autoFocus
            />
            <button 
              onClick={onSave}
              className="p-1 text-green-600 hover:bg-green-50 rounded-md"
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              onClick={onCancel}
              className="p-1 text-red-500 hover:bg-red-50 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {chapter.title || `Chapter ${id}`}
            </span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
              <button 
                onClick={() => onEdit(id)}
                className="p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                title="Edit chapter"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                title="Delete chapter"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Scene Count */}
        <span className="text-xs text-gray-500">
          {Object.keys(chapter.scenes || {}).length} scenes
        </span>
      </div>

      {/* Scenes List */}
      {isExpanded && (
        <div className="ml-8 mt-1 space-y-1">
          {Object.entries(chapter.scenes || {}).map(([sceneId, scene]) => (
            <div
              key={sceneId}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-gray-50 ${
                isSelected === sceneId ? 'bg-purple-50' : ''
              }`}
              onClick={() => onSelect({ type: 'scene', chapterId: id, sceneId })}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-600">{scene.id || sceneId}</span>
              {/* Scene Actions */}
              <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect({ type: 'scene', chapterId: id, sceneId });
                  }}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                  title="Edit scene"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this scene?')) {
                      const updatedScenes = { ...chapter.scenes };
                      delete updatedScenes[sceneId];
                      onChange(id, { ...chapter, scenes: updatedScenes });
                    }
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                  title="Delete scene"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {/* Add Scene Button */}
          <button
            onClick={() => {
              const newSceneId = `scene${Object.keys(chapter.scenes || {}).length + 1}`;
              onChange(id, {
                ...chapter,
                scenes: {
                  ...chapter.scenes,
                  [newSceneId]: {
                    id: newSceneId,
                    content: '',
                    decisions: []
                  }
                }
              });
              onSelect({ type: 'scene', chapterId: id, sceneId: newSceneId });
            }}
            className="flex items-center gap-2 w-full py-1.5 px-3 text-sm text-purple-600 hover:bg-purple-50 rounded-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Scene
          </button>
        </div>
      )}
    </div>
  );
};

const ChaptersTreeDesigner = ({
  story,
  selectedId,
  onStoryChange,
  onSelect,
  selected
}) => {
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [editingChapter, setEditingChapter] = useState(null);
  const [previousChapterState, setPreviousChapterState] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Toggle chapter expansion
  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  // Add new chapter
  const handleAddChapter = () => {
    const newChapterId = `chapter${Object.keys(story.chapters).length + 1}`;
    const newChapter = {
      title: `New Chapter`,
      scenes: {}
    };
    
    onStoryChange({
      ...story,
      chapters: {
        ...story.chapters,
        [newChapterId]: newChapter
      }
    });
    
    // Auto expand and start editing new chapter
    setExpandedChapters(prev => new Set([...prev, newChapterId]));
    setEditingChapter(newChapterId);
    // Store the previous state for cancellation
    setPreviousChapterState(newChapter);
  };

  // Start editing chapter
  const handleEditChapter = (chapterId) => {
    setEditingChapter(chapterId);
    // Store the current state for cancellation
    setPreviousChapterState(story.chapters[chapterId]);
  };

  // Save chapter edits
  const handleSaveChapter = () => {
    setEditingChapter(null);
    setPreviousChapterState(null);
  };

  // Cancel chapter edits
  const handleCancelEdit = () => {
    if (editingChapter && previousChapterState) {
      onStoryChange({
        ...story,
        chapters: {
          ...story.chapters,
          [editingChapter]: previousChapterState
        }
      });
    }
    setEditingChapter(null);
    setPreviousChapterState(null);
  };

  // Update chapter
  const handleChapterChange = (chapterId, updatedChapter) => {
    onStoryChange({
      ...story,
      chapters: {
        ...story.chapters,
        [chapterId]: updatedChapter
      }
    });
  };

  // Delete chapter
  const handleDeleteChapter = (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      const { [chapterId]: _, ...remainingChapters } = story.chapters;
      onStoryChange({
        ...story,
        chapters: remainingChapters
      });
      // If the deleted chapter was being edited, clear the editing state
      if (editingChapter === chapterId) {
        setEditingChapter(null);
        setPreviousChapterState(null);
      }
    }
  };

  // Handle chapter reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) return;

    const oldIndex = Object.keys(story.chapters).indexOf(active.id);
    const newIndex = Object.keys(story.chapters).indexOf(over.id);

    const orderedChapterIds = arrayMove(
      Object.keys(story.chapters),
      oldIndex,
      newIndex
    );

    const reorderedChapters = orderedChapterIds.reduce((acc, chapterId) => {
      acc[chapterId] = story.chapters[chapterId];
      return acc;
    }, {});

    onStoryChange({
      ...story,
      chapters: reorderedChapters
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Chapters</h3>
        <button
          onClick={handleAddChapter}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </button>
      </div>

      {/* Chapters List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={Object.keys(story.chapters)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 overflow-y-auto p-4">
            {Object.entries(story.chapters).map(([chapterId, chapter]) => (
              <SortableChapterItem
                key={chapterId}
                id={chapterId}
                chapter={chapter}
                isExpanded={expandedChapters.has(chapterId)}
                isEditing={editingChapter === chapterId}
                isSelected={selectedId === chapterId}
                onToggleExpand={() => toggleChapter(chapterId)}
                onEdit={handleEditChapter}
                onDelete={handleDeleteChapter}
                onSave={handleSaveChapter}
                onCancel={handleCancelEdit}
                onChange={handleChapterChange}
                onSelect={onSelect}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {Object.keys(story.chapters).length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <FolderPlus className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No chapters yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by adding your first chapter
          </p>
          <button
            onClick={handleAddChapter}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </button>
        </div>
      )}
    </div>
  );
};

export default ChaptersTreeDesigner;