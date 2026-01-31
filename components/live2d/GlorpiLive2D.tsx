'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, Settings, X, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// Configuration
// ==========================================
const MODEL_ENTRY_URL = '/glorpi_cat/glorpi_cat.model3.json';
const CUBISM4_CORE_URL = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js';

interface GlorpiLive2DProps {
  mood?: 'happy' | 'thinking' | 'concerned' | 'excited';
  className?: string;
  debug?: boolean;
}

interface AssetInfo {
  name: string;
  url: string;
  ok: boolean;
  size?: number;
}

interface LoadState {
  phase: 'idle' | 'loading-sdk' | 'checking-assets' | 'loading-model' | 'ready' | 'error';
  runtime: 'cubism4' | 'cubism2' | 'unknown';
  error?: string;
  assets: AssetInfo[];
  rendererType?: string;
  sdkLoaded: boolean;
}

// Load Cubism 4 SDK Core
async function loadCubism4SDK(): Promise<boolean> {
  // Check if already loaded
  if (typeof window !== 'undefined' && (window as any).Live2DCubismCore) {
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = CUBISM4_CORE_URL;
    script.async = true;
    script.onload = () => {
      console.log('[Live2D] Cubism 4 SDK Core loaded');
      resolve(true);
    };
    script.onerror = () => {
      console.error('[Live2D] Failed to load Cubism 4 SDK Core');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

// Debug overlay
function DebugOverlay({
  state,
  onRetry,
  onClose,
}: {
  state: LoadState;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 bg-black/95 backdrop-blur-sm rounded-2xl overflow-auto p-3 text-xs"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">Live2D Debug</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-3 h-3 text-white" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Phase */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Phase:</span>
          <span className={cn(
            'font-mono',
            state.phase === 'ready' && 'text-validation-success',
            state.phase === 'error' && 'text-validation-error',
            !['ready', 'error'].includes(state.phase) && 'text-validation-warning'
          )}>
            {state.phase}
          </span>
        </div>

        {/* Runtime */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Runtime:</span>
          <span className="font-mono text-glorpi-mint">{state.runtime}</span>
        </div>

        {/* SDK Status */}
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">SDK Loaded:</span>
          {state.sdkLoaded ? (
            <CheckCircle className="w-3 h-3 text-validation-success" />
          ) : (
            <XCircle className="w-3 h-3 text-validation-error" />
          )}
        </div>

        {/* Renderer */}
        {state.rendererType && (
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Renderer:</span>
            <span className="font-mono text-white">{state.rendererType}</span>
          </div>
        )}

        {/* Error */}
        {state.error && (
          <div className="p-2 rounded bg-validation-error/20 border border-validation-error/30">
            <p className="text-validation-error break-words">{state.error}</p>
          </div>
        )}

        {/* Entry URL */}
        <div className="pt-2 border-t border-white/10">
          <p className="text-ink-muted mb-1">Entry:</p>
          <a
            href={MODEL_ENTRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-glorpi-mint hover:underline break-all flex items-center gap-1"
          >
            {MODEL_ENTRY_URL}
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
          </a>
        </div>

        {/* Assets */}
        {state.assets.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-ink-muted mb-1">Assets:</p>
            <div className="space-y-1">
              {state.assets.map((asset) => (
                <div key={asset.url} className="flex items-center gap-2">
                  {asset.ok ? (
                    <CheckCircle className="w-3 h-3 text-validation-success shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-validation-error shrink-0" />
                  )}
                  <span className="truncate text-ink-slate">{asset.name}</span>
                  {asset.size && (
                    <span className="text-ink-muted ml-auto">{(asset.size / 1024).toFixed(0)}K</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onRetry}
        className="mt-3 w-full py-2 rounded bg-glorpi-mint/20 text-glorpi-mint font-medium hover:bg-glorpi-mint/30 transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </motion.div>
  );
}

// Error fallback
function ErrorFallback({
  error,
  assets,
  onRetry,
}: {
  error: string;
  assets: AssetInfo[];
  onRetry: () => void;
}) {
  const failedAssets = assets.filter((a) => !a.ok);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-canvas-darker/95 rounded-2xl p-4">
      <div className="text-center max-w-full">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-validation-error/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-validation-error" />
        </div>
        <p className="text-sm font-medium text-white mb-1">Live2D Failed</p>
        <p className="text-xs text-ink-muted mb-3 max-h-12 overflow-auto">{error}</p>

        {failedAssets.length > 0 && (
          <div className="mb-3 p-2 rounded bg-black/30 text-left">
            <p className="text-2xs text-ink-muted mb-1">Missing:</p>
            {failedAssets.slice(0, 2).map((a) => (
              <p key={a.url} className="text-2xs text-validation-error truncate">{a.name}</p>
            ))}
          </div>
        )}

        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-glorpi-mint text-ink-charcoal text-sm font-medium hover:bg-glorpi-mint/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
  );
}

// Loading spinner
function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas-darker/80 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-glorpi-mint/30 border-t-glorpi-mint"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-xs text-ink-muted">{message}</span>
      </div>
    </div>
  );
}

export function GlorpiLive2D({ mood = 'happy', className, debug = false }: GlorpiLive2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>({
    phase: 'idle',
    runtime: 'cubism4', // We know from scan this is Cubism 4
    assets: [],
    sdkLoaded: false,
  });

  const isBrowser = typeof window !== 'undefined';
  const urlDebug = isBrowser && new URLSearchParams(window.location.search).has('live2dDebug');
  const debugEnabled = debug || urlDebug;

  // Check assets via diagnostic endpoint
  const checkAssets = useCallback(async (): Promise<AssetInfo[]> => {
    try {
      const res = await fetch('/api/live2d/diag');
      const data = await res.json();
      if (data.assets) {
        return data.assets.map((a: any) => ({
          name: a.path,
          url: a.url,
          ok: a.exists,
          size: a.size,
        }));
      }
    } catch (e) {
      console.error('[Live2D] Diag fetch failed:', e);
    }
    // Fallback: check manually
    const urls = [
      { name: 'model3.json', url: MODEL_ENTRY_URL },
      { name: 'moc3', url: '/glorpi_cat/glorpi_cat.moc3' },
      { name: 'texture_00', url: '/glorpi_cat/glorpi_cat.2048/texture_00.png' },
      { name: 'texture_01', url: '/glorpi_cat/glorpi_cat.2048/texture_01.png' },
      { name: 'physics', url: '/glorpi_cat/glorpi_cat.physics3.json' },
    ];
    const results: AssetInfo[] = [];
    for (const { name, url } of urls) {
      try {
        const r = await fetch(url, { method: 'HEAD' });
        const size = parseInt(r.headers.get('content-length') || '0', 10);
        results.push({ name, url, ok: r.ok, size: r.ok ? size : undefined });
      } catch {
        results.push({ name, url, ok: false });
      }
    }
    return results;
  }, []);

  // Main initialization
  const initLive2D = useCallback(async () => {
    if (!isBrowser || !containerRef.current || !canvasRef.current) return;

    // Phase 1: Load SDK
    setLoadState((s) => ({ ...s, phase: 'loading-sdk', error: undefined }));
    
    const sdkLoaded = await loadCubism4SDK();
    if (!sdkLoaded) {
      setLoadState((s) => ({
        ...s,
        phase: 'error',
        error: 'Failed to load Cubism 4 SDK Core. Check network/CORS.',
        sdkLoaded: false,
      }));
      return;
    }
    setLoadState((s) => ({ ...s, sdkLoaded: true }));

    // Phase 2: Check assets
    setLoadState((s) => ({ ...s, phase: 'checking-assets' }));
    const assets = await checkAssets();
    const allOk = assets.every((a) => a.ok);
    
    if (!allOk) {
      const failed = assets.filter((a) => !a.ok).map((a) => a.name).join(', ');
      setLoadState((s) => ({
        ...s,
        phase: 'error',
        error: `Missing assets: ${failed}`,
        assets,
      }));
      return;
    }
    setLoadState((s) => ({ ...s, assets }));

    // Phase 3: Load model
    setLoadState((s) => ({ ...s, phase: 'loading-model' }));

    try {
      // Dynamic imports
      const PIXI = await import('pixi.js');
      const { Live2DModel } = await import('pixi-live2d-display');

      // Register ticker
      if ((Live2DModel as any).registerTicker) {
        (Live2DModel as any).registerTicker(PIXI.Ticker);
      }

      const container = containerRef.current;
      const canvas = canvasRef.current;

      // Cleanup previous
      if (appRef.current) {
        try { appRef.current.destroy(true, { children: true, texture: true, baseTexture: true }); } catch {}
        appRef.current = null;
      }
      if (modelRef.current) {
        try { modelRef.current.destroy(); } catch {}
        modelRef.current = null;
      }

      // Create PIXI app
      const app = new PIXI.Application({
        view: canvas,
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundAlpha: 0,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      appRef.current = app;

      const rendererType = app.renderer.type === 1 ? 'WebGL' : 'Canvas';

      // Load model with timeout
      const loadPromise = Live2DModel.from(MODEL_ENTRY_URL, {
        autoInteract: false,
        autoUpdate: true,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Model load timeout (15s)')), 15000)
      );

      const model = await Promise.race([loadPromise, timeoutPromise]);
      modelRef.current = model;

      // Scale to fit
      const padding = 0.85;
      const scale = Math.min(
        container.clientWidth / model.width,
        container.clientHeight / model.height
      ) * padding;

      model.scale.set(scale);
      model.anchor.set(0.5, 0.5);
      model.x = container.clientWidth / 2;
      model.y = container.clientHeight / 2;

      // Add to stage
      (app.stage.addChild as Function)(model);

      // Mouse tracking
      const handlePointerMove = (e: PointerEvent) => {
        if (!containerRef.current || !modelRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        try { modelRef.current.focus(x, y); } catch {}
      };
      container.addEventListener('pointermove', handlePointerMove);

      // Visibility
      const handleVisibility = () => {
        if (!appRef.current?.ticker) return;
        document.hidden ? appRef.current.ticker.stop() : appRef.current.ticker.start();
      };
      document.addEventListener('visibilitychange', handleVisibility);

      // Resize
      const resizeObserver = new ResizeObserver(() => {
        if (!appRef.current || !containerRef.current || !modelRef.current) return;
        const c = containerRef.current;
        const m = modelRef.current;
        appRef.current.renderer.resize(c.clientWidth, c.clientHeight);
        const newScale = Math.min(c.clientWidth / m.width, c.clientHeight / m.height) * padding;
        m.scale.set(newScale);
        m.x = c.clientWidth / 2;
        m.y = c.clientHeight / 2;
      });
      resizeObserver.observe(container);

      setLoadState((s) => ({
        ...s,
        phase: 'ready',
        rendererType,
        error: undefined,
      }));

      // Cleanup
      return () => {
        container.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('visibilitychange', handleVisibility);
        resizeObserver.disconnect();
      };
    } catch (err) {
      console.error('[Live2D] Init error:', err);
      setLoadState((s) => ({
        ...s,
        phase: 'error',
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, [isBrowser, checkAssets]);

  // Initialize on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await initLive2D();
    };
    init();

    return () => {
      cleanup?.();
      if (modelRef.current) {
        try { modelRef.current.destroy(); } catch {}
        modelRef.current = null;
      }
      if (appRef.current) {
        try { appRef.current.destroy(true, { children: true, texture: true, baseTexture: true }); } catch {}
        appRef.current = null;
      }
    };
  }, [initLive2D, retryKey]);

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  const moodColors = {
    happy: 'bg-validation-success',
    thinking: 'bg-validation-info',
    concerned: 'bg-validation-warning',
    excited: 'bg-accent-orange',
  };

  const isLoading = ['idle', 'loading-sdk', 'checking-assets', 'loading-model'].includes(loadState.phase);
  const loadingMessages: Record<string, string> = {
    'idle': 'Initializing...',
    'loading-sdk': 'Loading SDK...',
    'checking-assets': 'Checking assets...',
    'loading-model': 'Loading Glorpi...',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-b from-canvas-card to-canvas-darker border border-white/[0.08] shadow-panel',
        className
      )}
    >
      {/* Top bar */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
        {debugEnabled && (
          <button
            onClick={() => setShowDebug((s) => !s)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showDebug ? 'bg-glorpi-mint/20 text-glorpi-mint' : 'bg-black/30 text-ink-muted hover:bg-black/40'
            )}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
        {!debugEnabled && <div />}

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
          <motion.div
            className={cn('w-2 h-2 rounded-full', moodColors[mood])}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-2xs text-ink-slate capitalize">{mood}</span>
        </div>
      </div>

      {/* Debug overlay */}
      <AnimatePresence>
        {showDebug && (
          <DebugOverlay state={loadState} onRetry={handleRetry} onClose={() => setShowDebug(false)} />
        )}
      </AnimatePresence>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={cn('w-full h-full', loadState.phase !== 'ready' && 'opacity-0')}
        style={{ display: 'block' }}
      />

      {/* Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div key="loading" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner message={loadingMessages[loadState.phase] || 'Loading...'} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {loadState.phase === 'error' && !showDebug && (
        <ErrorFallback
          error={loadState.error || 'Unknown error'}
          assets={loadState.assets}
          onRetry={handleRetry}
        />
      )}

      {/* Ready indicator */}
      {loadState.phase === 'ready' && debugEnabled && !showDebug && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-validation-success/20 text-2xs text-validation-success font-mono">
          {loadState.rendererType}
        </div>
      )}
    </div>
  );
}
