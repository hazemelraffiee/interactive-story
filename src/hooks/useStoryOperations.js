import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storyService from '../services/storyService';

export const useStoryOperations = (onUpdate = () => {}) => {
  const navigate = useNavigate();
  const [stateChanges, setStateChanges] = useState(new Map());
  const [notification, setNotification] = useState(null);

  const showNotification = (title, message) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleStoryRead = (story) => {
    navigate(`/story/${story._id}`);
  };

  const handleEdit = (story) => {
    navigate('/create', { state: { storyId: story._id } });
  };

  const handleDuplicate = async (storyId) => {
    try {
      const duplicatedStory = await storyService.duplicateStory(storyId);
      showNotification('Success', 'Story duplicated successfully');
      onUpdate(duplicatedStory); // Notify parent component of the change
      return duplicatedStory;
    } catch (error) {
      showNotification('Error', 'Failed to duplicate story');
      console.error('Error duplicating story:', error);
    }
  };

  const handleDelete = async (storyId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this story? This action cannot be undone.'
    );
    
    if (!confirmed) return;
  
    try {
      await storyService.deleteStory(storyId);
      showNotification('Success', 'Story deleted successfully');
      onUpdate(null, storyId); // Notify parent component of deletion
    } catch (error) {
      showNotification('Error', 'Failed to delete story');
      console.error('Error deleting story:', error);
    }
  };

  const handleStateChange = async (storyId, newState) => {
    // Prevent concurrent state changes for the same story
    if (stateChanges.get(storyId)) return;

    try {
      setStateChanges(prev => new Map(prev).set(storyId, true));
      
      await storyService.updateStoryStatus(storyId, newState);
      
      const messages = {
        published: 'Story published successfully',
        draft: 'Story moved to drafts',
        archived: 'Story archived successfully'
      };

      showNotification('Status Updated', messages[newState] || 'Status updated successfully');
      onUpdate({ id: storyId, status: newState }); // Notify parent of state change
    } catch (error) {
      showNotification('Error', 'Failed to update story status');
      console.error('Error updating story status:', error);
    } finally {
      setStateChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(storyId);
        return newMap;
      });
    }
  };

  return {
    handleStoryRead,
    handleEdit,
    handleDuplicate,
    handleDelete,
    handleStateChange,
    stateChanges,
    notification
  };
};