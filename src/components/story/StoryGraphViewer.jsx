import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { Share2, AlertCircle } from 'lucide-react';

const StoryGraphViewer = ({ story }) => {
  const [graphDefinition, setGraphDefinition] = useState('');
  
  useEffect(() => {
    // Initialize mermaid with specific configuration
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        primaryColor: '#9333ea',
        primaryTextColor: '#1f2937',
        lineColor: '#9333ea',
        secondaryColor: '#f3e8ff',
        tertiaryColor: '#ffffff'
      },
      flowchart: {
        curve: 'basis',
        padding: 20,
        useMaxWidth: true,
        htmlLabels: true,
        nodeSpacing: 100,
        rankSpacing: 150,
        ranker: 'longest-path'
      },
      securityLevel: 'loose'
    });
  }, []);

  // Helper function to sanitize text for Mermaid
  const sanitizeText = (text) => {
    if (!text) return '';
    return text.replace(/["']/g, '').replace(/[\n\r]/g, ' ');
  };

  // Helper function to generate a unique node ID
  const getNodeId = (chapterId, sceneId) => {
    return `${chapterId}_${sceneId}`.replace(/[^a-zA-Z0-9_]/g, '_');
  };

  useEffect(() => {
    // Generate graph definition
    let definition = 'flowchart LR\n';
    
    // Add styles
    definition += '  %% Node styles\n';
    definition += '  classDef chapter fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#9333ea,font-weight:500\n';
    definition += '  classDef scene fill:#ffffff,stroke:#d4d4d8,color:#333333\n';
    definition += '  classDef invalid fill:#fee2e2,stroke:#dc2626,color:#dc2626\n';
    definition += '  linkStyle default stroke:#9333ea,stroke-width:2px\n\n';

    // Process each chapter
    Object.entries(story.chapters).forEach(([chapterId, chapter]) => {
      // Create chapter subgraph with just the chapter title
      definition += `  subgraph ${chapterId}["${sanitizeText(chapter.title || chapterId)}"]\n`;
      
      // Add scenes with just their IDs
      Object.entries(chapter.scenes || {}).forEach(([sceneId, scene]) => {
        const nodeId = getNodeId(chapterId, sceneId);
        definition += `    ${nodeId}["${sceneId}"]\n`;
        definition += `    class ${nodeId} scene\n`;
        
        // Add connections from decisions
        (scene.decisions || []).forEach((decision) => {
          const decisionText = sanitizeText(decision.text).slice(0, 20) + (decision.text.length > 20 ? '...' : '');
          
          if (decision.nextScene) {
            const targetNodeId = getNodeId(chapterId, decision.nextScene);
            definition += `    ${nodeId} -->|"${decisionText}"| ${targetNodeId}\n`;
          }
          
          if (decision.nextChapter) {
            // Create a connection to the first scene of the target chapter
            const targetChapter = story.chapters[decision.nextChapter];
            if (targetChapter) {
              const firstSceneId = Object.keys(targetChapter.scenes || {})[0];
              if (firstSceneId) {
                const targetNodeId = getNodeId(decision.nextChapter, firstSceneId);
                definition += `    ${nodeId} -->|"${decisionText}"| ${targetNodeId}\n`;
              }
            }
          }
        });
      });
      
      definition += '  end\n';
      definition += `  class ${chapterId} chapter\n\n`;
    });

    setGraphDefinition(definition);
  }, [story]);

  useEffect(() => {
    if (graphDefinition) {
      try {
        const container = document.getElementById('graph-container');
        if (container) {
          mermaid.render('graphDiv', graphDefinition).then(({ svg }) => {
            container.innerHTML = svg;
            
            // Make the SVG responsive
            const svgElement = container.querySelector('svg');
            if (svgElement) {
              svgElement.style.width = 'auto';
              svgElement.style.height = '100%';
              svgElement.style.minWidth = '800px';
            }
          });
        }
      } catch (error) {
        console.error('Failed to render graph:', error);
      }
    }
  }, [graphDefinition]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Story Flow Graph</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span>Scroll and drag to explore the graph</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div id="graph-container" className="min-w-[800px] h-full">
          {/* Graph will be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default StoryGraphViewer;