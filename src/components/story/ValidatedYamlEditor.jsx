import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { load as yamlLoad } from 'js-yaml';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ValidatedYamlEditor = ({ value, onChange }) => {
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationStatus, setValidationStatus] = useState('pending');

  // Validation function from the existing validator
  const validateStory = useMemo(() => (storyData) => {
    const errors = [];
    
    if (!storyData.title) {
      errors.push('Story must have a title');
    }
    
    if (!storyData.chapters || Object.keys(storyData.chapters).length === 0) {
      errors.push('Story must have at least one chapter');
      return errors;
    }
    
    const allSceneIds = new Set();
    
    Object.entries(storyData.chapters).forEach(([chapterId, chapter]) => {
      if (chapter.scenes) {
        Object.keys(chapter.scenes).forEach(sceneId => {
          allSceneIds.add(sceneId);
        });
      }
    });
    
    Object.entries(storyData.chapters).forEach(([chapterId, chapter]) => {
      if (!chapter.title) {
        errors.push(`Chapter "${chapterId}" must have a title`);
      }
      
      if (!chapter.scenes || Object.keys(chapter.scenes).length === 0) {
        errors.push(`Chapter "${chapterId}" must have at least one scene`);
        return;
      }
      
      Object.entries(chapter.scenes).forEach(([sceneId, scene]) => {
        if (!scene.content) {
          errors.push(`Scene "${sceneId}" in chapter "${chapterId}" must have content`);
        }
        
        if (scene.decisions) {
          scene.decisions.forEach((decision, index) => {
            if (!decision.text) {
              errors.push(`Decision ${index} in scene "${sceneId}" must have text`);
            }
            
            if (!decision.nextScene) {
              errors.push(`Decision ${index} in scene "${sceneId}" must have a nextScene`);
            } else if (!allSceneIds.has(decision.nextScene)) {
              errors.push(`Decision ${index} in scene "${sceneId}" references non-existent scene "${decision.nextScene}"`);
            }
          });
        }
      });
    });

    return errors;
  }, []); // No dependencies as this is a pure function

  // Validate the YAML content
  const validateContent = useMemo(() => (content) => {
    try {
      // Parse YAML
      const storyData = yamlLoad(content);
      
      // Validate story structure
      const errors = validateStory(storyData);
      
      setValidationErrors(errors);
      setValidationStatus(errors.length === 0 ? 'valid' : 'invalid');
    } catch (e) {
      setValidationErrors([`YAML parsing error: ${e.message}`]);
      setValidationStatus('invalid');
    }
  }, [validateStory]); // Only depends on validateStory

  // Debounced validation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateContent(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, validateContent]); // Now includes all dependencies

  return (
    <div className="flex h-full">
      {/* Editor */}
      <div className="flex-1">
        <Editor
          defaultLanguage="yaml"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            tabSize: 2,
            theme: 'vs-light'
          }}
        />
      </div>

      {/* Validation Panel */}
      <div className="w-80 border-l border-gray-200 bg-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {validationStatus === 'valid' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-600">Story structure is valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-600">
                    {validationErrors.length} validation {validationErrors.length === 1 ? 'error' : 'errors'} found
                  </span>
                </>
              )}
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="mt-2 space-y-2 max-h-full overflow-y-auto">
              {validationErrors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidatedYamlEditor;