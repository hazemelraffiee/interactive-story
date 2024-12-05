import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FolderPlus
} from 'lucide-react';

const ChaptersManager = ({
  chapters = {},
  selectedChapterId,
  onChapterSelect,
  onChapterCreate,
  onChapterUpdate,
  onChapterDelete
}) => {
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Memoize the safe chapters object to prevent unnecessary re-renders
  const safeChapters = useMemo(() => chapters || {}, [chapters]);

  // Auto-select first chapter if none selected but chapters exist
  useEffect(() => {
    const chapterIds = Object.keys(safeChapters);
    if (chapterIds.length > 0 && !selectedChapterId) {
      onChapterSelect(chapterIds[0]);
    }
  }, [safeChapters, selectedChapterId, onChapterSelect]);

  const startEditing = useCallback((chapterId, currentTitle) => {
    setEditingChapterId(chapterId);
    setEditingTitle(currentTitle || '');
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingChapterId(null);
    setEditingTitle('');
  }, []);

  const saveEditing = useCallback(() => {
    if (editingChapterId && editingTitle.trim()) {
      onChapterUpdate(editingChapterId, { title: editingTitle.trim() });
      setEditingChapterId(null);
      setEditingTitle('');
    }
  }, [editingChapterId, editingTitle, onChapterUpdate]);

  const renderChapter = (chapterId, chapter) => {
    const isEditing = editingChapterId === chapterId;
    const isSelected = selectedChapterId === chapterId;
    const safeChapter = chapter || { title: '', scenes: {} };

    return (
      <div
        key={chapterId}
        className={`relative group rounded-lg
          ${isSelected ? 'bg-purple-50 ring-2 ring-purple-500' : ''}`}
      >
        <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg">
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md 
                          focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Chapter title..."
                autoFocus
              />
              <button
                onClick={saveEditing}
                className="p-1 text-green-600 hover:bg-green-50 rounded-md"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEditing}
                className="p-1 text-red-500 hover:bg-red-50 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="flex-1 flex items-center gap-2 cursor-pointer"
              onClick={() => onChapterSelect(chapterId)}
            >
              <span className="text-sm font-medium text-gray-900">
                {safeChapter.title || `Chapter ${chapterId}`}
              </span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(chapterId, safeChapter.title);
                  }}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this chapter?')) {
                      onChapterDelete(chapterId);
                    }
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-200 
                    flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Chapters</h3>
        <button
          onClick={onChapterCreate}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 
                   hover:bg-purple-50 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {Object.entries(safeChapters).map(([chapterId, chapter]) => 
            renderChapter(chapterId, chapter)
          )}
        </div>
      </div>

      {Object.keys(safeChapters).length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <FolderPlus className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-base font-medium text-gray-900 mb-2">
            No chapters yet
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-sm text-center">
            Get started by adding your first chapter
          </p>
          <button
            onClick={onChapterCreate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white 
                     rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Chapter</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChaptersManager;