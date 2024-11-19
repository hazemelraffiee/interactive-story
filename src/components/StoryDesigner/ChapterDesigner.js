import React from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Card,
  CardHeader,
  CardContent,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Button,
  Collapse,
} from '@mui/material';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

const SceneItem = ({
  scene,
  chapterId,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddDecision,
  onUpdateDecision,
  onDeleteDecision,
  availableScenes
}) => (
  <Card 
    sx={{ 
      mb: 2,
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: 3,
        transform: 'translateY(-2px)'
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={onToggle}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
        <TextField
          size="small"
          value={scene.id}
          onChange={(e) => onUpdate(chapterId, scene.id, 'id', e.target.value)}
          sx={{ flex: 1 }}
        />
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(chapterId, scene.id)}
        >
          <Trash2 size={18} />
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Animation"
            value={scene.animation}
            onChange={(e) => onUpdate(chapterId, scene.id, 'animation', e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="fadeIn">Fade In</MenuItem>
            <MenuItem value="slideInRight">Slide In Right</MenuItem>
            <MenuItem value="earthquake">Earthquake</MenuItem>
          </TextField>

          <TextField
            label="Content"
            multiline
            rows={4}
            value={scene.content}
            onChange={(e) => onUpdate(chapterId, scene.id, 'content', e.target.value)}
            fullWidth
            placeholder="Enter scene content... Use '>' for dialogue and '*' for thoughts"
          />

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Decisions</Typography>
              <Button
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => onAddDecision(chapterId, scene.id)}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Add Decision
              </Button>
            </Box>

            <List disablePadding>
              {scene.decisions.map((decision, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    mb: 1,
                    px: 2,
                    py: 1
                  }}
                >
                  <ListItemText>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        value={decision.text}
                        onChange={(e) => onUpdateDecision(chapterId, scene.id, index, 'text', e.target.value)}
                        placeholder="What should the player decide?"
                        fullWidth
                      />
                      <TextField
                        select
                        size="small"
                        value={decision.nextScene || ''}
                        onChange={(e) => onUpdateDecision(chapterId, scene.id, index, 'nextScene', e.target.value)}
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="">Select next scene</MenuItem>
                        {availableScenes.map((sceneId) => (
                          <MenuItem key={sceneId} value={sceneId}>
                            {sceneId}
                          </MenuItem>
                        ))}
                      </TextField>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteDecision(chapterId, scene.id, index)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Collapse>
    </CardContent>
  </Card>
);

const ChapterDesigner = ({
  chapter,
  chapterId,
  isExpanded,
  expandedSceneId,
  onToggle,
  onToggleScene,
  onUpdateChapter,
  onUpdateScene,
  onDeleteScene,
  onAddScene,
  onAddDecision,
  onUpdateDecision,
  onDeleteDecision,
  onDeleteChapter,
}) => {
  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardHeader
        sx={{
          background: 'linear-gradient(to right, #f0f7ff, #f5f3ff)',
          '&:hover': {
            background: 'linear-gradient(to right, #e6f0ff, #ede9ff)'
          }
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Plus size={18} />}
              onClick={() => onAddScene(chapterId)}
              variant="contained"
              size="small"
              sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
              Add Scene
            </Button>
            <IconButton
              onClick={() => onDeleteChapter(chapterId)}
              color="error"
              size="small"
            >
              <Trash2 size={18} />
            </IconButton>
          </Box>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={onToggle}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </IconButton>
            <TextField
              value={chapter.title}
              onChange={(e) => onUpdateChapter(chapterId, 'title', e.target.value)}
              variant="standard"
              sx={{ flex: 1 }}
            />
          </Box>
        }
      />

      <Collapse in={isExpanded}>
        <CardContent>
          <TextField
            select
            size="small"
            label="First Scene"
            value={chapter.firstSceneId}
            onChange={(e) => onUpdateChapter(chapterId, 'firstSceneId', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {Object.keys(chapter.scenes).map((sceneId) => (
              <MenuItem key={sceneId} value={sceneId}>
                {sceneId}
              </MenuItem>
            ))}
          </TextField>

          {Object.entries(chapter.scenes).map(([sceneId, scene]) => (
            <SceneItem
              key={sceneId}
              scene={scene}
              chapterId={chapterId}
              isExpanded={expandedSceneId === sceneId}
              onToggle={() => onToggleScene(expandedSceneId === sceneId ? null : sceneId)}
              onUpdate={onUpdateScene}
              onDelete={onDeleteScene}
              onAddDecision={onAddDecision}
              onUpdateDecision={onUpdateDecision}
              onDeleteDecision={onDeleteDecision}
              availableScenes={Object.keys(chapter.scenes)}
            />
          ))}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ChapterDesigner;