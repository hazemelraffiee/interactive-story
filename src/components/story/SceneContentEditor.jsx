import React, { useState, useRef } from 'react';
import { MessageCircle, Brain, Eye, Edit3 } from 'lucide-react';
import { Scene } from './InteractiveStoryViewer';

const SceneContentEditor = ({ value = '', onChange }) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef(null);

  const getCurrentLineInfo = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { text: '', start: 0, end: 0 };

    const cursorPos = textarea.selectionStart;
    const text = textarea.value;
    
    // Find start of line
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
    
    // Find end of line
    const lineEnd = text.indexOf('\n', cursorPos);
    const finalEnd = lineEnd === -1 ? text.length : lineEnd;
    
    // Get the line content
    const lineText = text.substring(lineStart, finalEnd);

    return {
      text: lineText,
      start: lineStart,
      end: finalEnd
    };
  };

  const updateLine = (newLineText) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = getCurrentLineInfo();
    const beforeLine = value.substring(0, start);
    const afterLine = value.substring(end);
    
    const newText = beforeLine + newLineText + afterLine;
    onChange(newText);
    
    // Restore cursor position
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
    <div className="rounded-lg border border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        {/* Left side - Formatting buttons or preview label */}
        <div className="flex items-center gap-1">
          {!isPreview ? (
            <>
              <button
                onClick={toggleDialogue}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors hover:bg-white/50 text-gray-600"
                title="Toggle Dialogue (Add/Remove '> ' prefix)"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Dialogue</span>
              </button>
              <button
                onClick={toggleThought}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors hover:bg-white/50 text-gray-600"
                title="Toggle Thought (Add/Remove '*' wrappers)"
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm">Thought</span>
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-600 px-3 py-1.5">
              Scene Preview
            </span>
          )}
        </div>

        {/* Right side - Preview toggle */}
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
      <div className="relative">
        {isPreview ? (
          <div className="p-6 min-h-[300px] bg-gray-50">
            <Scene 
              scene={{ content: value }} 
              showDecisions={false}
            />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[300px] p-4 resize-y bg-white border-0 focus:ring-0"
            placeholder="Write your scene content here..."
          />
        )}
      </div>
    </div>
  );
};

export default SceneContentEditor;