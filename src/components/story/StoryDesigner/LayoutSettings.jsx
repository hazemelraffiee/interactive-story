import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ViewSidebar as ViewSidebarIcon,
  Tab as TabIcon,
} from '@mui/icons-material';

export const LAYOUT_TYPES = {
  SPLIT: 'split',
  TAB: 'tab'
};

const LayoutSettings = ({ open, onClose, value, onChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event) => {
    onChange(event.target.value);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Layout Preferences</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Choose how you want to view the preview of your story:
        </Typography>
        <RadioGroup value={value} onChange={handleChange}>
          <Box sx={{ mb: 2, mt: 1 }}>
            <FormControlLabel
              value={LAYOUT_TYPES.SPLIT}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ViewSidebarIcon />
                  <div>
                    <Typography variant="body1">Split View</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Editor and preview side by side
                    </Typography>
                  </div>
                </Box>
              }
              disabled={isMobile}
            />
            {isMobile && (
              <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                Split view is not available on mobile devices
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box>
            <FormControlLabel
              value={LAYOUT_TYPES.TAB}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TabIcon />
                  <div>
                    <Typography variant="body1">Tab View</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Switch between editor and preview using tabs
                    </Typography>
                  </div>
                </Box>
              }
            />
          </Box>
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LayoutSettings;