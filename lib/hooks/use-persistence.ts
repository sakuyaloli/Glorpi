'use client';

/**
 * Persistence hooks for Studio
 * Handles autosave, loading, and syncing with server
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PromptBlock } from '@/lib/types';

// Types
interface SavedPrompt {
  id: string;
  title: string;
  blocks: PromptBlock[];
  compiledPrompt?: string;
  updatedAt: string;
}

interface UserSettings {
  defaultProvider: string;
  defaultModel: string;
  outputLengthPreset: string;
  outputTokenEstimate: number;
  preferences: Record<string, unknown>;
}

interface ProviderKeyStatus {
  name: string;
  configured: boolean;
  included?: boolean;
  last4?: string | null;
}

// ==========================================
// Autosave Hook
// ==========================================
export function useAutosave(
  promptId: string | null,
  title: string,
  blocks: PromptBlock[],
  compiledPrompt: string | undefined,
  debounceMs: number = 800
) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(promptId);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBlocksRef = useRef<string>('');
  
  const save = useCallback(async () => {
    // Serialize blocks for comparison
    const blocksJson = JSON.stringify(blocks);
    
    // Skip if nothing changed
    if (blocksJson === lastBlocksRef.current && currentPromptId) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentPromptId,
          title: title || 'Untitled Prompt',
          blocks,
          compiledPrompt,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save');
      }
      
      const data = await response.json();
      setCurrentPromptId(data.id);
      setLastSaved(new Date());
      lastBlocksRef.current = blocksJson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [blocks, title, compiledPrompt, currentPromptId]);
  
  // Debounced autosave
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [blocks, debounceMs, save]);
  
  return {
    saving,
    lastSaved,
    error,
    promptId: currentPromptId,
    saveNow: save,
  };
}

// ==========================================
// Load Prompt Hook
// ==========================================
export function useLoadPrompt(promptId: string | null) {
  const [prompt, setPrompt] = useState<SavedPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!promptId) {
      setPrompt(null);
      return;
    }
    
    const loadPrompt = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/user/prompts/${promptId}`);
        if (!response.ok) {
          throw new Error('Failed to load prompt');
        }
        const data = await response.json();
        setPrompt(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    };
    
    loadPrompt();
  }, [promptId]);
  
  return { prompt, loading, error };
}

// ==========================================
// User Settings Hook
// ==========================================
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      const data = await response.json();
      setSettings(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      return false;
    }
  }, []);
  
  return { settings, loading, error, updateSettings };
}

// ==========================================
// Provider Keys Hook
// ==========================================
export function useProviderKeys() {
  const [providers, setProviders] = useState<Record<string, ProviderKeyStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadKeys = useCallback(async () => {
    try {
      const response = await fetch('/api/user/keys');
      if (!response.ok) {
        throw new Error('Failed to load keys');
      }
      const data = await response.json();
      setProviders(data.providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadKeys();
  }, [loadKeys]);
  
  const saveKey = useCallback(async (provider: string, key: string, label?: string) => {
    try {
      const response = await fetch('/api/user/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key, label }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save key');
      }
      
      await loadKeys();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      return false;
    }
  }, [loadKeys]);
  
  const deleteKey = useCallback(async (provider: string, label?: string) => {
    try {
      const url = label 
        ? `/api/user/keys/${provider}?label=${encodeURIComponent(label)}`
        : `/api/user/keys/${provider}`;
        
      const response = await fetch(url, { method: 'DELETE' });
      
      if (!response.ok) {
        throw new Error('Failed to delete key');
      }
      
      await loadKeys();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  }, [loadKeys]);
  
  return { providers, loading, error, saveKey, deleteKey, refresh: loadKeys };
}

// ==========================================
// Prompts List Hook
// ==========================================
export function usePromptsList() {
  const [prompts, setPrompts] = useState<Array<{
    id: string;
    title: string;
    updatedAt: string;
    lastUsedAt: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadPrompts = useCallback(async () => {
    try {
      const response = await fetch('/api/user/prompts');
      if (!response.ok) {
        throw new Error('Failed to load prompts');
      }
      const data = await response.json();
      setPrompts(data.prompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);
  
  const deletePrompt = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/user/prompts/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      await loadPrompts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  }, [loadPrompts]);
  
  return { prompts, loading, error, deletePrompt, refresh: loadPrompts };
}
