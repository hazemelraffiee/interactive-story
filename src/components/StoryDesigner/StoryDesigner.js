import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import {
  Plus,
  Download,
  Trash2,
  ChevronRight,
  ChevronDown,
  Upload,
} from 'lucide-react';
import yaml from 'js-yaml';
import InteractiveStory, { animationStyles } from '../InteractiveStory/InteractiveStory';

const StoryDesigner = () => {
  const [story, setStory] = useState({
    title: '',
    chapters: {},
  });

  const [expandedChapter, setExpandedChapter] = useState(null);
  const [expandedScene, setExpandedScene] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);

  // Load story from localStorage on mount
  useEffect(() => {
    const savedStory = localStorage.getItem('story');
    if (savedStory) {
      try {
        const parsedStory = JSON.parse(savedStory);
        setStory(parsedStory);
      } catch (error) {
        console.error('Error parsing saved story:', error);
      }
    }
  }, []);

  // Save story to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('story', JSON.stringify(story));
    // Increment preview key to force refresh of InteractiveStory
    setPreviewKey(prev => prev + 1);
  }, [story]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add a new chapter
  const addChapter = () => {
    const chapterId = `chapter${Object.keys(story.chapters).length + 1}`;
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          id: chapterId,
          title: `New Chapter ${Object.keys(prev.chapters).length + 1}`,
          firstSceneId: 'scene1',
          scenes: {
            scene1: {
              id: 'scene1',
              animation: 'fadeIn',
              content: '',
              decisions: [],
            },
          },
        },
      },
    }));
    setExpandedChapter(chapterId);
    setExpandedScene(null);
  };

  // Add a new scene to a chapter
  const addScene = (chapterId) => {
    const sceneNumber =
      Object.keys(story.chapters[chapterId].scenes).length + 1;
    const sceneId = `scene${sceneNumber}`;
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          scenes: {
            ...prev.chapters[chapterId].scenes,
            [sceneId]: {
              id: sceneId,
              animation: 'fadeIn',
              content: '',
              decisions: [],
            },
          },
        },
      },
    }));
    setExpandedScene(sceneId);
  };

  // Delete a scene from a chapter
  const deleteScene = (chapterId, sceneId) => {
    setStory((prev) => {
      const newScenes = { ...prev.chapters[chapterId].scenes };
      delete newScenes[sceneId];
      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [chapterId]: {
            ...prev.chapters[chapterId],
            scenes: newScenes,
          },
        },
      };
    });
  };

  // Add a decision to a scene
  const addDecision = (chapterId, sceneId) => {
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          scenes: {
            ...prev.chapters[chapterId].scenes,
            [sceneId]: {
              ...prev.chapters[chapterId].scenes[sceneId],
              decisions: [
                ...prev.chapters[chapterId].scenes[sceneId].decisions,
                { text: '', nextScene: '' },
              ],
            },
          },
        },
      },
    }));
  };

  // Update story title
  const updateStoryTitle = (title) => {
    setStory((prev) => ({ ...prev, title }));
  };

  // Update chapter title
  const updateChapterTitle = (chapterId, title) => {
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          title,
        },
      },
    }));
  };

  // Update firstSceneId of a chapter
  const updateFirstSceneId = (chapterId, firstSceneId) => {
    setStory((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          firstSceneId,
        },
      },
    }));
  };

  // Update a scene's field
  const updateScene = (chapterId, sceneId, field, value) => {
    // Handle renaming scene IDs
    if (field === 'id') {
      setStory((prev) => {
        const scenes = { ...prev.chapters[chapterId].scenes };
        const sceneData = { ...scenes[sceneId], id: value };
        delete scenes[sceneId];
        scenes[value] = sceneData;

        // Update firstSceneId if necessary
        let updatedChapter = { ...prev.chapters[chapterId] };
        if (prev.chapters[chapterId].firstSceneId === sceneId) {
          updatedChapter.firstSceneId = value;
        }

        // Update decisions that reference this scene
        Object.values(scenes).forEach((scene) => {
          scene.decisions = scene.decisions.map((decision) => {
            if (decision.nextScene === sceneId) {
              return { ...decision, nextScene: value };
            }
            return decision;
          });
        });

        return {
          ...prev,
          chapters: {
            ...prev.chapters,
            [chapterId]: {
              ...updatedChapter,
              scenes,
            },
          },
        };
      });
    } else {
      setStory((prev) => ({
        ...prev,
        chapters: {
          ...prev.chapters,
          [chapterId]: {
            ...prev.chapters[chapterId],
            scenes: {
              ...prev.chapters[chapterId].scenes,
              [sceneId]: {
                ...prev.chapters[chapterId].scenes[sceneId],
                [field]: value,
              },
            },
          },
        },
      }));
    }
  };

  // Update a decision's field
  const updateDecision = (chapterId, sceneId, index, field, value) => {
    setStory((prev) => {
      const decisions =
        prev.chapters[chapterId].scenes[sceneId].decisions.map(
          (decision, i) =>
            i === index ? { ...decision, [field]: value } : decision
        );
      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [chapterId]: {
            ...prev.chapters[chapterId],
            scenes: {
              ...prev.chapters[chapterId].scenes,
              [sceneId]: {
                ...prev.chapters[chapterId].scenes[sceneId],
                decisions,
              },
            },
          },
        },
      };
    });
  };

  // Remove a decision from a scene
  const removeDecision = (chapterId, sceneId, index) => {
    setStory((prev) => {
      const decisions =
        prev.chapters[chapterId].scenes[sceneId].decisions.filter(
          (_, i) => i !== index
        );
      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [chapterId]: {
            ...prev.chapters[chapterId],
            scenes: {
              ...prev.chapters[chapterId].scenes,
              [sceneId]: {
                ...prev.chapters[chapterId].scenes[sceneId],
                decisions,
              },
            },
          },
        },
      };
    });
  };

  // Export the story as a YAML file
  const exportStory = () => {
    const yamlString = yaml.dump(story);
    const blob = new Blob([yamlString], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.toLowerCase().replace(/\s+/g, '_')}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import a story from a YAML file
  const importStory = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedStory = yaml.load(e.target.result);
        setStory(importedStory);
        setExpandedChapter(null);
        setExpandedScene(null);
      } catch (error) {
        console.error('Error parsing YAML file:', error);
      }
    };
    reader.readAsText(file);
  };

  // Build options for the Next Scene/Chapter dropdown
  const buildNextOptions = () => {
    const options = [];
    options.push(
      <option key="select-option" value="">
        Select next step
      </option>
    );
    Object.entries(story.chapters).forEach(([chapterId, chapter]) => {
      options.push(
        <option key={chapterId} value={`chapter:${chapterId}`}>
          Chapter: {chapterId}
        </option>
      );
      Object.keys(chapter.scenes).forEach((sceneId) => {
        options.push(
          <option
            key={`${chapterId}-${sceneId}`}
            value={`scene:${chapterId}:${sceneId}`}
          >
            &nbsp;&nbsp;Scene: {sceneId} (in {chapterId})
          </option>
        );
      });
    });
    return options;
  };

  // Handle change in Next Scene/Chapter dropdown
  const handleNextChange = (chapterId, sceneId, index, value) => {
    if (value.startsWith('chapter:')) {
      const nextChapterId = value.replace('chapter:', '');
      updateDecision(chapterId, sceneId, index, 'nextChapter', nextChapterId);
      updateDecision(chapterId, sceneId, index, 'nextScene', undefined);
    } else if (value.startsWith('scene:')) {
      const [, , nextSceneId] = value.split(':');
      updateDecision(chapterId, sceneId, index, 'nextChapter', undefined);
      updateDecision(chapterId, sceneId, index, 'nextScene', nextSceneId);
    } else {
      updateDecision(chapterId, sceneId, index, 'nextChapter', undefined);
      updateDecision(chapterId, sceneId, index, 'nextScene', undefined);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto flex gap-4">
      {/* Left Side - Story Designer */}
      <div className="w-3/5">
        <Card>
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">
                Interactive Story Designer
              </h1>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Story Title
                </label>
                <Input
                  value={story.title}
                  onChange={(e) => updateStoryTitle(e.target.value)}
                  placeholder="Enter story title"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(story.chapters).map(([chapterId, chapter]) => (
                <Card key={chapterId} className="p-4">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() =>
                      setExpandedChapter(
                        expandedChapter === chapterId ? null : chapterId
                      )
                    }
                  >
                    {expandedChapter === chapterId ? (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
                    <Input
                      value={chapter.title}
                      onChange={(e) =>
                        updateChapterTitle(chapterId, e.target.value)
                      }
                      className="w-full"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {expandedChapter === chapterId && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          First Scene ID
                        </label>
                        <select
                          value={chapter.firstSceneId}
                          onChange={(e) =>
                            updateFirstSceneId(chapterId, e.target.value)
                          }
                          className="w-full p-2 border rounded"
                        >
                          {Object.keys(chapter.scenes).map((sceneId) => (
                            <option key={sceneId} value={sceneId}>
                              {sceneId}
                            </option>
                          ))}
                        </select>
                      </div>

                      {Object.entries(chapter.scenes).map(([sceneId, scene]) => (
                        <Card key={sceneId} className="p-4">
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() =>
                              setExpandedScene(
                                expandedScene === sceneId ? null : sceneId
                              )
                            }
                          >
                            {expandedScene === sceneId ? (
                              <ChevronDown className="w-4 h-4 mr-2" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-2" />
                            )}
                            <Input
                              value={scene.id}
                              onChange={(e) =>
                                updateScene(
                                  chapterId,
                                  sceneId,
                                  'id',
                                  e.target.value
                                )
                              }
                              className="w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteScene(chapterId, sceneId);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {expandedScene === sceneId && (
                            <div className="mt-4 space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Animation
                                </label>
                                <select
                                  value={scene.animation}
                                  onChange={(e) =>
                                    updateScene(
                                      chapterId,
                                      sceneId,
                                      'animation',
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="fadeIn">fadeIn</option>
                                  <option value="slideInRight">
                                    slideInRight
                                  </option>
                                  <option value="earthquake">earthquake</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Content
                                </label>
                                <Textarea
                                  value={scene.content}
                                  onChange={(e) =>
                                    updateScene(
                                      chapterId,
                                      sceneId,
                                      'content',
                                      e.target.value
                                    )
                                  }
                                  rows={4}
                                  className="w-full"
                                  placeholder="Enter scene content..."
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-medium">
                                    Decisions
                                  </label>
                                  <Button
                                    size="sm"
                                    onClick={() => addDecision(chapterId, sceneId)}
                                    className="flex items-center"
                                  >
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                    Decision
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  {scene.decisions.map((decision, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <Input
                                        value={decision.text}
                                        onChange={(e) =>
                                          updateDecision(
                                            chapterId,
                                            sceneId,
                                            index,
                                            'text',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Decision text"
                                        className="flex-1"
                                      />
                                      <select
                                        value={
                                          decision.nextChapter
                                            ? `chapter:${decision.nextChapter}`
                                            : decision.nextScene
                                            ? `scene:${chapterId}:${decision.nextScene}`
                                            : ''
                                        }
                                        onChange={(e) =>
                                          handleNextChange(
                                            chapterId,
                                            sceneId,
                                            index,
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 p-2 border rounded"
                                      >
                                        {buildNextOptions()}
                                      </select>
                                      <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={() =>
                                          removeDecision(
                                            chapterId,
                                            sceneId,
                                            index
                                          )
                                        }
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                      <Button
                        onClick={() => addScene(chapterId)}
                        className="w-full flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Scene
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={addChapter} className="flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Chapter
              </Button>
              <Button
                onClick={exportStory}
                className="flex items-center"
                disabled={!story.title}
              >
                <Download className="w-4 h-4 mr-1" /> Export Story
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".yaml,.yml"
                  onChange={importStory}
                  className="hidden"
                  id="import-story"
                />
                <label htmlFor="import-story">
                  <Button className="flex items-center">
                    <Upload className="w-4 h-4 mr-1" /> Import Story
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Side - Interactive Preview */}
      <div className="w-2/5 h-[calc(100vh-2rem)] sticky top-4">
        <Card className="h-full overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Story Preview</h2>
          </div>
          <div className="h-[calc(100%-4rem)] overflow-auto">
            <InteractiveStory 
              key={previewKey}
              story={story}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StoryDesigner;
