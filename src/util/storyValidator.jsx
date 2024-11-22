const storySchema = {
    type: 'object',
    required: ['title', 'chapters'],
    properties: {
      title: { type: 'string' },
      chapters: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          required: ['title', 'scenes'],
          properties: {
            title: { type: 'string' },
            scenes: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string' },
                  decisions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['text', 'nextScene'],
                      properties: {
                        text: { type: 'string' },
                        nextScene: { type: 'string' }
                      }
                    },
                    default: []
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  
  function validateStory(storyData) {
    // First, basic schema validation
    const errors = [];
    
    // Validate basic structure
    if (!storyData.title) {
      errors.push('Story must have a title');
    }
    
    if (!storyData.chapters || Object.keys(storyData.chapters).length === 0) {
      errors.push('Story must have at least one chapter');
      return errors;
    }
    
    // Track all scene IDs for reference validation
    const allSceneIds = new Set();
    
    // Collect all scene IDs first
    Object.entries(storyData.chapters).forEach(([chapterId, chapter]) => {
      if (chapter.scenes) {
        Object.keys(chapter.scenes).forEach(sceneId => {
          allSceneIds.add(sceneId);
        });
      }
    });
    
    // Validate chapters and scenes
    Object.entries(storyData.chapters).forEach(([chapterId, chapter]) => {
      if (!chapter.title) {
        errors.push(`Chapter "${chapterId}" must have a title`);
      }
      
      if (!chapter.scenes || Object.keys(chapter.scenes).length === 0) {
        errors.push(`Chapter "${chapterId}" must have at least one scene`);
        return;
      }
      
      // Validate scenes
      Object.entries(chapter.scenes).forEach(([sceneId, scene]) => {
        if (!scene.content) {
          errors.push(`Scene "${sceneId}" in chapter "${chapterId}" must have content`);
        }
        
        // Validate decisions
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
    
    // Check for unreachable scenes
    const reachableScenes = new Set();
    
    // Add all first scenes from each chapter as reachable
    Object.values(storyData.chapters).forEach(chapter => {
      const firstSceneId = Object.keys(chapter.scenes)[0];
      reachableScenes.add(firstSceneId);
    });
    
    // Traverse through all decisions to find reachable scenes
    let newScenesFound = true;
    while (newScenesFound) {
      newScenesFound = false;
      Object.values(storyData.chapters).forEach(chapter => {
        Object.entries(chapter.scenes).forEach(([sceneId, scene]) => {
          if (reachableScenes.has(sceneId) && scene.decisions) {
            scene.decisions.forEach(decision => {
              if (!reachableScenes.has(decision.nextScene)) {
                reachableScenes.add(decision.nextScene);
                newScenesFound = true;
              }
            });
          }
        });
      });
    }
    
    // Check for unreachable scenes
    allSceneIds.forEach(sceneId => {
      if (!reachableScenes.has(sceneId)) {
        errors.push(`Scene "${sceneId}" is unreachable from any starting point`);
      }
    });
    
    // Check for dead ends (scenes with no decisions that aren't endings)
    Object.values(storyData.chapters).forEach(chapter => {
      Object.entries(chapter.scenes).forEach(([sceneId, scene]) => {
        if (!scene.decisions || scene.decisions.length === 0) {
          // This is a dead end, but it might be intentional
          // You might want to add a warning rather than an error
          // errors.push(`Scene "${sceneId}" is a dead end (has no decisions)`);
        }
      });
    });
    
    return errors;
  }
  
  // Example usage:
  function validateStoryYaml(yamlString) {
    try {
      const yaml = require('js-yaml');
      const storyData = yaml.load(yamlString);
      const errors = validateStory(storyData);
      
      if (errors.length === 0) {
        return { valid: true, errors: [] };
      } else {
        return { valid: false, errors };
      }
    } catch (e) {
      return { valid: false, errors: [`YAML parsing error: ${e.message}`] };
    }
  }
  
  // Export the validator and schema
  module.exports = {
    storySchema,
    validateStory,
    validateStoryYaml
  };