/**
 * CodeDNA
 * useConversation.ts — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { getOrCreateConversation } from '../store/slices/chatSlice';

export const useConversation = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const navigateToChat = async (userId: string) => {
    try {
      const resultAction = await dispatch(getOrCreateConversation(userId));
      if (getOrCreateConversation.fulfilled.match(resultAction)) {
        const conversation = resultAction.payload;
        navigate('/messages', { state: { conversationId: conversation._id } });
      }
    } catch (err) {
      console.error('Failed to navigate to chat:', err);
    }
  };

  return { navigateToChat };
};
