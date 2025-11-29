
import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { db } from "@/lib/mock-db";
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeMessages(conversationId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidateMessageQueries = useCallback(() => {
    if (conversationId) {
      // Invalidate specific conversation messages
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
    }
    // Always invalidate inbox conversations to update counters and last messages
    queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
  }, [conversationId, queryClient]);

  const playNotificationSound = useCallback(() => {
    try {
      // Create a subtle notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound (two-tone chime)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      invalidateMessageQueries();
      playNotificationSound();
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
    }, 15000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [user?.id, conversationId, invalidateMessageQueries, playNotificationSound]);

  return { 
    invalidateMessageQueries,
    playNotificationSound
  };
}
