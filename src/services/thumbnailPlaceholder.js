// utils/thumbnailPlaceholder.js

/**
 * Generates an elegant SVG placeholder with balanced proportions between title and author.
 * The title remains prominent while maintaining readability and visual harmony.
 */
const generateThumbnailPlaceholder = (title, author, width = 800, height = 400) => {
    // Prepare the display text with appropriate fallbacks
    const displayTitle = (title || 'Untitled Story').substring(0, 100);
    const displayAuthor = (author || 'Anonymous').substring(0, 50);
    
    // Calculate the available space and padding
    const padding = Math.min(width, height) * 0.05;
    
    // More balanced font size calculations
    // We use a smaller percentage of the container height for better proportions
    const titleFontSize = Math.min(
      height * 0.15,  // Reduced from 0.3 to 0.15
      width * 0.08    // Reduced from 0.15 to 0.08
    );
    const authorFontSize = titleFontSize * 0.35;  // Slightly reduced ratio for better balance
    
    // Generate unique IDs for the gradients
    const gradientId = `grad-${Math.random().toString(36).substring(7)}`;
    const backgroundGradientId = `bg-${Math.random().toString(36).substring(7)}`;
  
    // Helper function to split title into appropriate lines
    const splitTitle = (text) => {
      const maxCharsPerLine = Math.ceil(width / titleFontSize * 1.5); // Dynamic line length
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
  
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      return lines;
    };
  
    const titleLines = splitTitle(displayTitle);
    const lineHeight = titleFontSize * 1.2;
    const totalTitleHeight = titleLines.length * lineHeight;
    const titleStartY = (height - totalTitleHeight) / 2;
  
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="${backgroundGradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e" />
            <stop offset="100%" style="stop-color:#16213e" />
          </linearGradient>
          
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc" />
            <stop offset="100%" style="stop-color:#e2e8f0" />
          </linearGradient>
          
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&amp;display=swap');
            .background { fill: url(#${backgroundGradientId}); }
            .title {
              font-family: 'Dancing Script', cursive;
              font-size: ${titleFontSize}px;
              fill: url(#${gradientId});
              text-anchor: middle;
              dominant-baseline: middle;
            }
            .author {
              font-family: 'Dancing Script', cursive;
              font-size: ${authorFontSize}px;
              fill: #9f7aea;
              text-anchor: end;
              dominant-baseline: middle;
            }
          </style>
        </defs>
        
        <!-- Background with gradient -->
        <rect class="background" width="100%" height="100%" />
        
        <!-- Subtle decorative elements -->
        <circle cx="${padding}" cy="${padding}" r="${Math.min(width, height) * 0.06}" 
                fill="#9f7aea" opacity="0.1" />
        <circle cx="${width - padding}" cy="${height - padding}" r="${Math.min(width, height) * 0.06}" 
                fill="#9f7aea" opacity="0.1" />
        
        <!-- Title text with balanced sizing -->
        ${titleLines.map((line, index) => `
          <text class="title" x="50%" y="${titleStartY + (index * lineHeight)}">
            ${line}
          </text>
        `).join('')}
        
        <!-- Author attribution -->
        <text class="author" x="${width - padding}" y="${height - padding}">
          by ${displayAuthor}
        </text>
      </svg>
    `;
  
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  };
  
  /**
   * Helper function to get the appropriate thumbnail for a story.
   * Returns either the existing thumbnail or generates a placeholder.
   */
  export const getStoryThumbnail = (story) => {
    if (!story?.thumbnail) {
      const authorName = typeof story?.author === 'object' 
        ? story.author?.username || 'Anonymous'
        : story?.author || 'Anonymous';
      return generateThumbnailPlaceholder(story?.title, authorName);
    }
    return story.thumbnail;
  };
  
  // Export both functions for flexibility
  export { generateThumbnailPlaceholder };
  export default getStoryThumbnail;