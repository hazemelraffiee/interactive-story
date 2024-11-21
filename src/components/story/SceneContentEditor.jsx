import React, { useState, useRef } from 'react';
import { MessageCircle, Brain, Eye, Edit3, Plus, Trash2, ChevronDown, AlertCircle } from 'lucide-react';
import { Scene } from './InteractiveStoryViewer';

const ChapterSceneSelector = ({ 
  story,
  value,
  onChange,
  placeholder = "Select target...",
  onCreateNewScene,
  onCreateNewChapter
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check if the current value is valid
  const isInvalid = value && (
    (value.nextChapter && !story.chapters[value.nextChapter]) ||
    (value.nextScene && !Object.values(story.chapters).some(
      chapter => Object.keys(chapter.scenes || {}).includes(value.nextScene)
    ))
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-white border rounded-md flex items-center justify-between text-left focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
          isInvalid 
            ? 'border-red-300 bg-red-50 hover:border-red-400' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        title={isInvalid ? 'This target no longer exists in the story' : undefined}
      >
        <span className={`text-sm ${isInvalid ? 'text-red-600' : ''}`}>
          {value ? (
            value.nextChapter ? 
              `Chapter: ${story.chapters[value.nextChapter]?.title || value.nextChapter}${isInvalid ? ' (Invalid)' : ''}` :
              `Scene: ${value.nextScene}${isInvalid ? ' (Invalid)' : ''}`
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {isInvalid && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <ChevronDown className={`w-4 h-4 ${isInvalid ? 'text-red-500' : 'text-gray-500'}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {Object.entries(story.chapters).map(([chapterId, chapter]) => (
            <div key={chapterId} className="divide-y divide-gray-100">
              {/* Chapter option */}
              <button
                type="button"
                onClick={() => {
                  onChange({ nextChapter: chapterId });
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-purple-50 text-sm font-medium text-gray-900"
              >
                Chapter: {chapter.title || chapterId}
              </button>
              
              {/* Scene options */}
              {Object.entries(chapter.scenes || {}).map(([sceneId, scene]) => (
                <button
                  key={sceneId}
                  type="button"
                  onClick={() => {
                    onChange({ nextScene: sceneId });
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-purple-50 text-sm text-gray-600 pl-6"
                >
                  Scene: {scene.id || sceneId}
                </button>
              ))}
              
              {/* New Scene option */}
              <button
                type="button"
                onClick={() => {
                  const newScene = onCreateNewScene(chapterId);
                  onChange({ nextScene: newScene.id });
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-purple-50 text-sm text-purple-600 pl-6 font-medium border-t border-gray-100"
              >
                + New Scene in this Chapter
              </button>
            </div>
          ))}
          
          {/* New Chapter option */}
          <button
            type="button"
            onClick={() => {
              const newChapter = onCreateNewChapter();
              onChange({ nextChapter: newChapter.id });
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-purple-50 text-sm text-purple-600 font-medium border-t border-gray-100"
          >
            + Create New Chapter
          </button>
        </div>
      )}
    </div>
  );
};

const SceneContentEditor = ({ 
  scene, 
  chapterId, 
  sceneId, 
  onChange,
  story,
  onCreateChapter,
  onCreateScene 
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef(null);

  const handleContentChange = (newContent) => {
    onChange(chapterId, sceneId, 'content', newContent);
  };

  const handleDecisionChange = (index, field, value) => {
    const newDecisions = [...(scene.decisions || [])];
    newDecisions[index] = { ...newDecisions[index], [field]: value };
    onChange(chapterId, sceneId, 'decisions', newDecisions);
  };

  const addDecision = () => {
    const newDecisions = [...(scene.decisions || []), {
      text: '',
      nextScene: '',
      conditions: []
    }];
    onChange(chapterId, sceneId, 'decisions', newDecisions);
  };

  const removeDecision = (index) => {
    const newDecisions = [...(scene.decisions || [])];
    newDecisions.splice(index, 1);
    onChange(chapterId, sceneId, 'decisions', newDecisions);
  };

  const getCurrentLineInfo = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { text: '', start: 0, end: 0 };

    const cursorPos = textarea.selectionStart;
    const text = textarea.value;
    
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
    const lineEnd = text.indexOf('\n', cursorPos);
    const finalEnd = lineEnd === -1 ? text.length : lineEnd;
    
    return {
      text: text.substring(lineStart, finalEnd),
      start: lineStart,
      end: finalEnd
    };
  };

  const updateLine = (newLineText) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = getCurrentLineInfo();
    const beforeLine = scene.content.substring(0, start);
    const afterLine = scene.content.substring(end);
    
    handleContentChange(beforeLine + newLineText + afterLine);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newLineText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toggleDialogue = () => {
    const { text } = getCurrentLineInfo();
    if (text.startsWith('> ')) {
      updateLine(text.substring(2));
    } else {
      updateLine(`> ${text}`);
    }
  };

  const toggleThought = () => {
    const { text } = getCurrentLineInfo();
    if (text.startsWith('*') && text.endsWith('*')) {
      updateLine(text.substring(1, text.length - 1));
    } else {
      updateLine(`*${text}*`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scene Content Editor */}
      <div className="rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-1">
            {!isPreview ? (
              <>
                <button
                  onClick={toggleDialogue}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors hover:bg-white/50 text-gray-600"
                  title="Toggle Dialogue"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Dialogue</span>
                </button>
                <button
                  onClick={toggleThought}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors hover:bg-white/50 text-gray-600"
                  title="Toggle Thought"
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">Thought</span>
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-600 px-3 py-1.5">Scene Preview</span>
            )}
          </div>

          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors hover:bg-white text-gray-600"
          >
            {isPreview ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm">Preview</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          {isPreview ? (
            <div className="p-6 min-h-[300px] bg-gray-50">
              <Scene scene={scene} showDecisions={false} />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={scene.content || ''}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full min-h-[300px] p-4 resize-y bg-white border-0 focus:ring-0"
              placeholder="Write your scene content here..."
            />
          )}
        </div>
      </div>

      {/* Decisions Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Decisions</h3>
          <button
            onClick={addDecision}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md"
          >
            <Plus className="w-4 h-4" />
            Add Decision
          </button>
        </div>

        <div className="space-y-4">
          {(scene.decisions || []).map((decision, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    value={decision.text || ''}
                    onChange={(e) => handleDecisionChange(index, 'text', e.target.value)}
                    placeholder="Decision text..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <ChapterSceneSelector
                    story={story}
                    value={{ 
                      nextChapter: decision.nextChapter,
                      nextScene: decision.nextScene
                    }}
                    onChange={(target) => {
                      // Clear both fields first
                      const updatedDecision = { ...decision };
                      delete updatedDecision.nextChapter;
                      delete updatedDecision.nextScene;
                      // Then set the new target
                      handleDecisionChange(index, Object.keys(target)[0], Object.values(target)[0]);
                    }}
                    placeholder="Select target chapter or scene..."
                    onCreateNewScene={(chapterId) => {
                      const newSceneId = `scene${Object.keys(story.chapters[chapterId].scenes || {}).length + 1}`;
                      const newScene = {
                        id: newSceneId,
                        content: '',
                        decisions: []
                      };
                      
                      // Create the new scene through the callback
                      onCreateScene(chapterId, newSceneId, newScene);
                      return newScene;
                    }}
                    onCreateNewChapter={() => {
                      const newChapterId = `chapter${Object.keys(story.chapters).length + 1}`;
                      const newChapter = {
                        title: 'New Chapter',
                        scenes: {}
                      };
                      
                      onCreateChapter(newChapterId, newChapter);
                      return { id: newChapterId, ...newChapter };
                    }}
                  />
                </div>
                <button
                  onClick={() => removeDecision(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                  title="Remove decision"
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
};

export default SceneContentEditor;