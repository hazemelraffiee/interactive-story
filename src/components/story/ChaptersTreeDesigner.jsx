import React, { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FolderPlus,
  AlertCircle
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

// Helper function to check if a scene has invalid decisions
const hasInvalidDecisions = (scene, story) => {
  if (!scene.decisions) return false;

  return scene.decisions.some(decision => {
    if (decision.nextChapter && !story.chapters[decision.nextChapter]) {
      return true;
    }
    if (decision.nextScene) {
      return !Object.values(story.chapters).some(
        chapter => Object.keys(chapter.scenes || {}).includes(decision.nextScene)
      );
    }
    return false;
  });
};

const SortableChapterItem = ({
  id,
  chapter,
  story,
  isExpanded,
  isEditing,
  selected,
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

  const isChapterSelected = selected?.type === 'chapter' && selected?.chapterId === id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isChapterSelected ? 'bg-purple-50 ring-2 ring-purple-500' : ''}`}
    >
      <div className="flex items-center gap-2 py-3 md:py-2 px-4 md:px-3 hover:bg-gray-50 rounded-lg">
        <div
          {...attributes}
          {...listeners}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-grab touch-manipulation"
        >
          <GripVertical className="w-6 h-6 md:w-4 md:h-4 text-gray-400 p-1" />
        </div>

        <button
          onClick={onToggleExpand}
          className="p-1 -m-1 text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronDown className="w-6 h-6 md:w-4 md:h-4" />
          ) : (
            <ChevronRight className="w-6 h-6 md:w-4 md:h-4" />
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={chapter.title}
              onChange={e => onChange(id, { ...chapter, title: e.target.value })}
              className="flex-1 px-3 py-2 md:px-2 md:py-1 text-base md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Chapter title..."
              autoFocus
            />
            <button
              onClick={onSave}
              className="p-2 md:p-1 text-green-600 hover:bg-green-50 rounded-md"
            >
              <Check className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-2 md:p-1 text-red-500 hover:bg-red-50 rounded-md"
            >
              <X className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex-1 flex items-center gap-2 cursor-pointer"
            onClick={() => onSelect({ type: 'chapter', chapterId: id })}
          >
            <span className="text-base md:text-sm font-medium text-gray-900">
              {chapter.title || `Chapter ${id}`}
            </span>
            <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-2 md:gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                className="p-2 md:p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                title="Edit chapter"
              >
                <Pencil className="w-5 h-5 md:w-4 md:h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="p-2 md:p-1 text-red-500 hover:bg-red-50 rounded-md"
                title="Delete chapter"
              >
                <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        )}

        <span className="text-sm md:text-xs text-gray-500">
          {Object.keys(chapter.scenes || {}).length} scenes
        </span>
      </div>

      {isExpanded && (
        <div className="ml-6 md:ml-8 mt-2 md:mt-1 space-y-2 md:space-y-1">
          {Object.entries(chapter.scenes || {}).map(([sceneId, scene]) => {
            const hasInvalid = hasInvalidDecisions(scene, story);
            const isSceneSelected = selected?.type === 'scene' &&
              selected?.chapterId === id &&
              selected?.sceneId === sceneId;

            return (
              <div
                key={sceneId}
                className={`flex items-center gap-2 py-2 md:py-1.5 px-4 md:px-3 rounded-md hover:bg-gray-50/75 transition-colors cursor-pointer
        ${hasInvalid ? 'border border-red-200' : ''}
        ${isSceneSelected
                    ? hasInvalid
                      ? 'bg-red-50 ring-2 ring-purple-500 ring-offset-2'
                      : 'bg-purple-50 ring-2 ring-purple-500'
                    : hasInvalid
                      ? 'bg-red-50'
                      : ''
                  }`}
                onClick={() => onSelect({ type: 'scene', chapterId: id, sceneId })}
              >
                <div className={`w-2 h-2 md:w-1.5 md:h-1.5 rounded-full ${hasInvalid ? 'bg-red-400' : 'bg-gray-400'
                  }`}></div>
                <span className={`text-base md:text-sm ${hasInvalid ? 'text-red-600' : 'text-gray-600'
                  }`}>
                  {scene.id || sceneId}
                </span>
                {hasInvalid && (
                  <AlertCircle className="w-4 h-4 text-red-500" title="Scene contains invalid decision targets" />
                )}
                <div className="ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-2 md:gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newId = window.prompt('Enter new scene ID:', scene.id || sceneId);
                      if (newId && newId !== sceneId) {
                        const updatedScenes = { ...chapter.scenes };
                        delete updatedScenes[sceneId];
                        updatedScenes[newId] = { ...scene, id: newId };
                        onChange(id, { ...chapter, scenes: updatedScenes });
                        onSelect({ type: 'scene', chapterId: id, sceneId: newId });
                      }
                    }}
                    className="p-2 md:p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                    title="Edit scene"
                  >
                    <Pencil className="w-5 h-5 md:w-3.5 md:h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this scene?')) {
                        const updatedScenes = { ...chapter.scenes };
                        delete updatedScenes[sceneId];
                        onChange(id, { ...chapter, scenes: updatedScenes });
                        if (isSceneSelected) {
                          onSelect(null);
                        }
                      }
                    }}
                    className="p-2 md:p-1 text-red-500 hover:bg-red-50 rounded-md"
                    title="Delete scene"
                  >
                    <Trash2 className="w-5 h-5 md:w-3.5 md:h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
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
            className="flex items-center gap-2 w-full py-2 md:py-1.5 px-4 md:px-3 text-base md:text-sm text-purple-600 hover:bg-purple-50 rounded-md"
          >
            <Plus className="w-5 h-5 md:w-3.5 md:h-3.5" />
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

  // Configure sensors with better touch handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Add delay for touch devices to distinguish between tap and drag
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Toggle chapter expansion with touch-friendly handling
  const toggleChapter = useCallback((chapterId) => {
    setExpandedChapters(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(chapterId)) {
        newExpanded.delete(chapterId);
      } else {
        newExpanded.add(chapterId);
      }
      return newExpanded;
    });
  }, []);

  // Add new chapter
  const handleAddChapter = useCallback(() => {
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
    setPreviousChapterState(newChapter);
  }, [story, onStoryChange]);

  // Handle chapter actions with proper state management
  const handleEditChapter = useCallback((chapterId) => {
    setEditingChapter(chapterId);
    setPreviousChapterState(story.chapters[chapterId]);
  }, [story.chapters]);

  const handleSaveChapter = useCallback(() => {
    setEditingChapter(null);
    setPreviousChapterState(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
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
  }, [editingChapter, previousChapterState, story, onStoryChange]);

  const handleChapterChange = useCallback((chapterId, updatedChapter) => {
    onStoryChange({
      ...story,
      chapters: {
        ...story.chapters,
        [chapterId]: {
          ...story.chapters[chapterId],  // Keep existing chapter properties
          ...updatedChapter,  // Apply updates while preserving existing properties
          scenes: updatedChapter.scenes
        }
      }
    });
  }, [story, onStoryChange]);

  const handleDeleteChapter = useCallback((chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      const { [chapterId]: _, ...remainingChapters } = story.chapters;
      onStoryChange({
        ...story,
        chapters: remainingChapters
      });

      if (editingChapter === chapterId) {
        setEditingChapter(null);
        setPreviousChapterState(null);
      }
    }
  }, [story, onStoryChange, editingChapter]);

  // Handle chapter reordering with improved touch handling
  const handleDragEnd = useCallback((event) => {
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
  }, [story, onStoryChange]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-10 bg-white p-4 md:p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-base md:text-sm font-medium text-gray-700">Chapters</h3>
        <button
          onClick={handleAddChapter}
          className="flex items-center gap-2 px-4 py-2 md:px-3 md:py-1.5 text-base md:text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
        >
          <Plus className="w-5 h-5 md:w-4 md:h-4" />
          Add Chapter
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={Object.keys(story.chapters)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2 md:space-y-1">
              {Object.entries(story.chapters).map(([chapterId, chapter]) => (
                <SortableChapterItem
                  key={chapterId}
                  id={chapterId}
                  chapter={chapter}
                  story={story}
                  isExpanded={expandedChapters.has(chapterId)}
                  isEditing={editingChapter === chapterId}
                  selected={selected}
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
          </div>
        </SortableContext>
      </DndContext>

      {Object.keys(story.chapters).length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-4">
          <FolderPlus className="w-16 h-16 md:w-12 md:h-12 text-gray-400 mb-6 md:mb-4" />
          <h3 className="text-lg md:text-base font-medium text-gray-900 mb-2">
            No chapters yet
          </h3>
          <p className="text-base md:text-sm text-gray-500 mb-6 md:mb-4 max-w-sm text-center">
            Get started by adding your first chapter
          </p>
          <button
            onClick={handleAddChapter}
            className="flex items-center gap-2 px-6 py-3 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-base md:text-sm">Add Chapter</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChaptersTreeDesigner;