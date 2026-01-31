'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  Gift,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProviderId } from '@/lib/types';
import { Navigation } from '@/components/layout/Navigation';
import { BlueprintGrid } from '@/components/design/BlueprintGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProviderConfig {
  id: ProviderId;
  name: string;
  keyPrefix: string;
  docsUrl: string;
  included?: boolean; // OpenAI is included free
}

const providers: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
    included: true, // Free tier included
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    keyPrefix: 'sk-ant-',
    docsUrl: 'https://console.anthropic.com/',
  },
  {
    id: 'gemini',
    name: 'Google (Gemini)',
    keyPrefix: '',
    docsUrl: 'https://aistudio.google.com/apikey',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.deepseek.com/',
  },
];

const STORAGE_KEY = 'glorpi_api_keys';

interface StoredKeys {
  [key: string]: string;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<StoredKeys>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [useOwnOpenAI, setUseOwnOpenAI] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setKeys(parsed);
        // Check if user has their own OpenAI key
        if (parsed.openai) {
          setUseOwnOpenAI(true);
        }
      }
    } catch (e) {
      console.error('Failed to load keys:', e);
    }
  }, []);

  // Save keys to localStorage
  const saveKeys = (newKeys: StoredKeys) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
      setKeys(newKeys);
    } catch (e) {
      console.error('Failed to save keys:', e);
    }
  };

  const handleSaveKey = (providerId: string) => {
    if (!inputValue.trim()) return;
    const newKeys = { ...keys, [providerId]: inputValue.trim() };
    saveKeys(newKeys);
    setEditingKey(null);
    setInputValue('');
    if (providerId === 'openai') {
      setUseOwnOpenAI(true);
    }
  };

  const handleRemoveKey = (providerId: string) => {
    const newKeys = { ...keys };
    delete newKeys[providerId];
    saveKeys(newKeys);
    if (providerId === 'openai') {
      setUseOwnOpenAI(false);
    }
  };

  const handleClearAllKeys = () => {
    if (confirm('Are you sure you want to clear all stored API keys?')) {
      localStorage.removeItem(STORAGE_KEY);
      setKeys({});
      setUseOwnOpenAI(false);
    }
  };

  const toggleUseOwnOpenAI = () => {
    if (useOwnOpenAI) {
      // Switching to included - remove custom key
      handleRemoveKey('openai');
    } else {
      // Switching to own key - start editing
      setEditingKey('openai');
      setUseOwnOpenAI(true);
    }
  };

  const getStatus = (provider: ProviderConfig): 'included' | 'configured' | 'byok' => {
    if (provider.included && !useOwnOpenAI) return 'included';
    if (keys[provider.id]) return 'configured';
    return 'byok';
  };

  return (
    <BlueprintGrid className="min-h-screen">
      <Navigation />

      <main className="pt-20 pb-16 max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink-white mb-2">Settings</h1>
          <p className="text-sm text-ink-graphite">
            Configure your AI provider API keys.
          </p>
        </div>

        {/* Provider Configuration */}
        <section className="mb-8">
          <h2 className="text-base font-medium text-ink-white mb-4">
            Provider Configuration
          </h2>

          <div className="settings-card overflow-hidden">
            <div className="divide-y divide-white/[0.06]">
              {providers.map((provider) => {
                const status = getStatus(provider);
                const isEditing = editingKey === provider.id;
                const hasKey = !!keys[provider.id];

                return (
                  <div
                    key={provider.id}
                    className="p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                            status === 'included' && 'bg-glorpi-mint/10',
                            status === 'configured' && 'bg-validation-success/10',
                            status === 'byok' && 'bg-white/5'
                          )}
                        >
                          {status === 'included' ? (
                            <Gift className="w-4 h-4 text-glorpi-mint" />
                          ) : status === 'configured' ? (
                            <CheckCircle2 className="w-4 h-4 text-validation-success" />
                          ) : (
                            <KeyRound className="w-4 h-4 text-ink-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-white">{provider.name}</p>
                          
                          {/* OpenAI special case - toggle for included vs own key */}
                          {provider.included && (
                            <button
                              onClick={toggleUseOwnOpenAI}
                              className="text-xs text-ink-muted hover:text-glorpi-mint transition-colors mt-1"
                            >
                              {useOwnOpenAI ? '← Use included key' : 'Use my own key instead'}
                            </button>
                          )}
                          
                          {/* Key input when editing */}
                          {isEditing && (
                            <div className="mt-3 flex gap-2">
                              <Input
                                type="password"
                                placeholder={`${provider.keyPrefix}...`}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="h-9 text-sm font-mono bg-black/20 border-white/10"
                              />
                              <Button size="sm" onClick={() => handleSaveKey(provider.id)} className="h-9 px-3">
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => { setEditingKey(null); setInputValue(''); }}
                                className="h-9 px-2"
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          
                          {/* Show masked key if configured */}
                          {hasKey && !isEditing && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs font-mono text-ink-muted">
                                {showKey[provider.id] 
                                  ? keys[provider.id] 
                                  : `${provider.keyPrefix}${'•'.repeat(20)}`
                                }
                              </span>
                              <button
                                onClick={() => setShowKey(s => ({ ...s, [provider.id]: !s[provider.id] }))}
                                className="p-1 rounded hover:bg-white/5 text-ink-muted hover:text-ink-slate"
                              >
                                {showKey[provider.id] ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium',
                            status === 'included' && 'bg-glorpi-mint/10 text-glorpi-mint',
                            status === 'configured' && 'bg-validation-success/10 text-validation-success',
                            status === 'byok' && 'bg-white/5 text-ink-muted'
                          )}
                        >
                          {status === 'included' ? 'Included' : status === 'configured' ? 'Configured' : 'BYOK'}
                        </span>
                        
                        {/* Action buttons */}
                        {status === 'byok' && !isEditing && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingKey(provider.id)}
                            className="h-8 px-2 text-xs"
                          >
                            Add key
                          </Button>
                        )}
                        
                        {hasKey && !isEditing && (
                          <button
                            onClick={() => handleRemoveKey(provider.id)}
                            className="p-1.5 rounded-md hover:bg-validation-error/10 text-ink-muted hover:text-validation-error transition-colors"
                            title="Remove key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-white/5 text-ink-muted hover:text-glorpi-mint transition-colors"
                          title="Get API key"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Storage Info */}
        <section className="mb-8">
          <div className="settings-info-panel p-4">
            <div className="flex gap-3">
              <KeyRound className="w-4 h-4 text-glorpi-mint shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-ink-white text-sm mb-1">Client-side storage only</p>
                <p className="text-ink-graphite text-xs leading-relaxed">
                  Your API keys are stored locally in your browser (localStorage). They are never sent to our servers, committed to any repository, or logged. 
                  Keys are sent directly to the AI provider when you make a request.
                </p>
              </div>
            </div>
          </div>

          {Object.keys(keys).length > 0 && (
            <div className="mt-3 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAllKeys}
                className="h-8 px-3 text-xs text-ink-muted hover:text-validation-error"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear all keys
              </Button>
            </div>
          )}
        </section>

        {/* OpenAI included notice */}
        <section>
          <div className="settings-included-panel p-4">
            <div className="flex gap-3">
              <Gift className="w-4 h-4 text-glorpi-mint shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink-white text-sm mb-1">OpenAI included</p>
                <p className="text-ink-graphite text-xs leading-relaxed">
                  OpenAI GPT models are available by default at no cost. For higher rate limits or to use your own billing, 
                  add your own OpenAI API key above.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </BlueprintGrid>
  );
}
