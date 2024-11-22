import React, { useState, useRef } from 'react';
import { MessageCircle, Brain, Eye, Edit3, Plus, Trash2, ChevronDown, AlertCircle, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Scene } from './InteractiveStoryViewer';

const ChapterSceneSelector = ({ 
  story,
  value,
  onChange,
  placeholder = "Select target scene...",
  onCreateNewScene
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get all available scenes across all chapters
  const allScenes = Object.entries(story.chapters).reduce((acc, [chapterId, chapter]) => {
    Object.keys(chapter.scenes || {}).forEach(sceneId => {
      acc.push({ chapterId, sceneId });
    });
    return acc;
  }, []);

  // Validate if the current scene exists
  const isInvalid = value && !allScenes.some(
    scene => scene.sceneId === value
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
      >
        <span className={`text-sm ${isInvalid ? 'text-red-600' : ''}`}>
          {value ? 
            `Scene: ${value}${isInvalid ? ' (Invalid)' : ''}` :
            <span className="text-gray-500">{placeholder}</span>
          }
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
              {/* Chapter header */}
              <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50">
                {chapter.title || chapterId}
              </div>
              
              {/* Scene options */}
              {Object.entries(chapter.scenes || {}).map(([sceneId, scene]) => (
                <button
                  key={sceneId}
                  type="button"
                  onClick={() => {
                    onChange(sceneId);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-purple-50 text-sm text-gray-600"
                >
                  {sceneId}
                </button>
              ))}
              
              {/* New Scene option */}
              <button
                type="button"
                onClick={() => {
                  const newScene = onCreateNewScene(chapterId);
                  onChange(newScene);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-purple-50 text-sm text-purple-600 font-medium"
              >
                + New Scene in this Chapter
              </button>
            </div>
          ))}
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
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const textareaRef = useRef(null);

  // Get chapter title
  const chapterTitle = story.chapters[chapterId]?.title || chapterId;

  const handleContentChange = (newContent) => {
    onChange(chapterId, sceneId, 'content', newContent);
  };

  const handleDecisionChange = (index, field, value) => {
    const newDecisions = [...(scene.decisions || [])];
    newDecisions[index] = { 
      ...newDecisions[index],
      [field]: value
    };
    onChange(chapterId, sceneId, 'decisions', newDecisions);
  };

  const addDecision = () => {
    const newDecisions = [...(scene.decisions || []), {
      text: '',
      nextScene: '',
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
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Scene Header */}
      <div className="flex-none bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Scene: {sceneId}
            </h2>
            <p className="text-sm text-gray-500">
              Chapter: {chapterTitle}
            </p>
          </div>
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
            title={isPanelCollapsed ? "Show decisions panel" : "Hide decisions panel"}
          >
            {isPanelCollapsed ? (
              <PanelRightOpen className="w-5 h-5" />
            ) : (
              <PanelRightClose className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Scene Content Editor */}
        <div className={`flex-1 flex flex-col min-w-0 ${!isPanelCollapsed && 'lg:border-r'} border-gray-200`}>
          {/* Editor Toolbar */}
          <div className="flex-none flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
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

          {/* Editor/Preview Area */}
          <div className="flex-1 relative">
            {isPreview ? (
              <div className="absolute inset-0 overflow-auto">
                <div className="p-6 bg-gray-50 min-h-full">
                  <Scene scene={scene} showDecisions={false} />
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={scene.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                className="absolute inset-0 w-full h-full p-4 resize-none bg-white focus:ring-0 border-0"
                placeholder="Write your scene content here..."
              />
            )}
          </div>
        </div>

        {/* Decisions Panel */}
        <div className={`
          bg-white flex flex-col min-h-0
          ${isPanelCollapsed ? 'hidden lg:flex' : 'flex'}
          lg:w-96
        `}>
          <div className="flex-none px-4 py-3 border-b border-gray-200">
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
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(scene.decisions || []).map((decision, index) => (
              <div key={index} className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-4 space-y-4">
                  <input
                    type="text"
                    value={decision.text || ''}
                    onChange={(e) => handleDecisionChange(index, 'text', e.target.value)}
                    placeholder="Decision text..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <ChapterSceneSelector
                        story={story}
                        value={decision.nextScene}
                        onChange={(target) => handleDecisionChange(index, 'nextScene', target)}
                        placeholder="Select target scene..."
                        onCreateNewScene={(chapterId) => {
                          const newSceneId = `scene${Object.keys(story.chapters[chapterId].scenes || {}).length + 1}`;
                          const newScene = {
                            content: '',
                            decisions: []
                          };
                          
                          onCreateScene(chapterId, newSceneId, newScene);
                          return newSceneId;
                        }}
                      />
                    </div>
                    <button
                      onClick={() => removeDecision(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md flex-none"
                      title="Remove decision"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(scene.decisions || []).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  No decisions yet. Add a decision to create branching paths in your story.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneContentEditor;