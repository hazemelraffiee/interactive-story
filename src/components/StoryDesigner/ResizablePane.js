import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const ResizablePane = ({ children, initialWidth = '50%', minWidth = 200, side = 'left' }) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = side === 'left' 
          ? e.clientX 
          : window.innerWidth - e.clientX;
        if (newWidth >= minWidth && newWidth <= window.innerWidth - minWidth) {
          setWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing, minWidth, side]);

  return (
    <Box 
      sx={{
        position: 'relative',
        width,
        minWidth,
        transition: isResizing ? 'none' : 'width 0.3s ease',
        height: '100%'
      }}
    >
      {children}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          [side === 'left' ? 'right' : 'left']: -8,
          width: 16,
          height: '100%',
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            '& .MuiIconButton-root': {
              opacity: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }
        }}
        onMouseDown={() => setIsResizing(true)}
      >
        <IconButton
          size="small"
          sx={{
            opacity: 0.5,
            transition: 'all 0.2s',
            backgroundColor: 'background.paper',
            boxShadow: 1,
            '&:hover': {
              backgroundColor: 'background.paper'
            }
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ResizablePane;