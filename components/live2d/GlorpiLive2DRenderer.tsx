'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// Types
// ==========================================
type GlorpiExpression = 'question' | 'cry' | 'eye_glow' | 'fluff' | 'neutral';

interface Props {
  showDebug?: boolean;
  onCloseDebug?: () => void;
  expression?: GlorpiExpression;
  onContainerClick?: () => void;
}

// Expression param names to search for (case-insensitive)
const EXPRESSION_KEYS = ['cry', 'eye_glow', 'fluff', 'question'];

// ==========================================
// Main Component - SIMPLE AND STABLE
// ==========================================
export function GlorpiLive2DRenderer({ expression, onContainerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixiAppRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const expressionMapRef = useRef<Map<string, number[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // Expression setter - call AFTER model is loaded
  // ==========================================
  const applyExpression = useCallback((name: GlorpiExpression | null) => {
    const model = modelRef.current;
    if (!model) return;

    try {
      const internalModel = model.internalModel;
      if (!internalModel) return;

      // Find core model for parameter access
      const coreModel = 
        (internalModel as any).coreModel ||
        (internalModel as any).model?._coreModel ||
        (internalModel as any).model?.coreModel;

      if (!coreModel || !coreModel.setParameterValueByIndex) return;

      // Reset all expression params to 0
      for (const [, indices] of expressionMapRef.current) {
        for (const idx of indices) {
          coreModel.setParameterValueByIndex(idx, 0);
        }
      }

      // Set target expression params to 1
      if (name && name !== 'neutral') {
        const indices = expressionMapRef.current.get(name);
        if (indices) {
          for (const idx of indices) {
            coreModel.setParameterValueByIndex(idx, 1);
          }
        }
      }
    } catch (err) {
      console.warn('[Live2D] Expression error:', err);
    }
  }, []);

  // ==========================================
  // Discover expression params from loaded model
  // ==========================================
  const discoverExpressionParams = useCallback((model: any) => {
    const map = new Map<string, number[]>();
    
    try {
      const internalModel = model.internalModel;
      if (!internalModel) return map;

      const coreModel = 
        (internalModel as any).coreModel ||
        (internalModel as any).model?._coreModel ||
        (internalModel as any).model?.coreModel;

      if (!coreModel?.getParameterCount || !coreModel?.getParameterId) return map;

      const count = coreModel.getParameterCount();
      
      for (let i = 0; i < count; i++) {
        const paramId = coreModel.getParameterId(i);
        if (!paramId) continue;
        
        const idLower = paramId.toLowerCase();
        
        for (const key of EXPRESSION_KEYS) {
          if (idLower.includes(key) || idLower.includes(key.replace('_', ''))) {
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(i);
          }
        }
      }
      
      console.log('[Live2D] Expression params found:', Object.fromEntries(map));
    } catch (err) {
      console.warn('[Live2D] Param discovery error:', err);
    }
    
    return map;
  }, []);

  // ==========================================
  // Single init effect - STABLE LIFECYCLE
  // ==========================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    let app: any = null;
    let model: any = null;

    const init = async () => {
      try {
        // Wait for container to have size
        let w = container.clientWidth;
        let h = container.clientHeight;
        for (let i = 0; i < 30 && (w <= 0 || h <= 0); i++) {
          await new Promise(r => requestAnimationFrame(r));
          w = container.clientWidth;
          h = container.clientHeight;
        }
        if (w <= 0 || h <= 0 || !mounted) return;

        // Wait for Cubism SDK
        for (let i = 0; i < 30 && !(window as any).Live2DCubismCore; i++) {
          await new Promise(r => setTimeout(r, 100));
        }
        if (!(window as any).Live2DCubismCore || !mounted) {
          setError('Cubism SDK not loaded');
          setLoading(false);
          return;
        }

        // Import Pixi and Live2D
        const PIXI = await import('pixi.js');
        const { Live2DModel } = await import('pixi-live2d-display/cubism4');
        if (!mounted) return;

        // Register ticker
        (Live2DModel as any).registerTicker(PIXI.Ticker);

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'width:100%;height:100%;display:block;';
        container.appendChild(canvas);

        // Create Pixi application
        app = new PIXI.Application({
          view: canvas,
          width: w,
          height: h,
          backgroundAlpha: 0,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          antialias: true,
        });
        pixiAppRef.current = app;

        // Load model
        model = await Live2DModel.from('/glorpi_cat/glorpi_cat.model3.json', {
          autoInteract: false,
          autoUpdate: true,
        });
        if (!mounted) {
          model.destroy();
          return;
        }

        modelRef.current = model;
        (app.stage.addChild as Function)(model);

        // Fit model to container
        await new Promise(r => setTimeout(r, 50));
        
        model.visible = true;
        model.alpha = 1;
        model.position.set(0, 0);
        model.scale.set(1, 1);
        
        const bounds = model.getBounds();
        if (bounds && bounds.width > 0 && bounds.height > 0) {
          const scale = Math.min(w / bounds.width, h / bounds.height) * 0.85;
          model.scale.set(scale, scale);
          const nb = model.getBounds();
          model.x = (w / 2) - (nb.x + nb.width / 2);
          model.y = (h / 2) - (nb.y + nb.height / 2) + h * 0.04;
        } else {
          // Fallback
          const scale = Math.min(w, h) / 800;
          model.scale.set(scale, scale);
          model.x = w / 2;
          model.y = h * 0.55;
        }

        // Discover expression parameters
        expressionMapRef.current = discoverExpressionParams(model);

        // Mouse tracking
        const onPointerMove = (e: PointerEvent) => {
          if (!modelRef.current || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          try {
            modelRef.current.focus(e.clientX - rect.left, e.clientY - rect.top);
          } catch {}
        };
        document.addEventListener('pointermove', onPointerMove);

        // Resize handler
        const onResize = () => {
          const c = containerRef.current;
          const a = pixiAppRef.current;
          const m = modelRef.current;
          if (!c || !a || !m) return;
          
          const nw = c.clientWidth;
          const nh = c.clientHeight;
          if (nw <= 0 || nh <= 0) return;
          
          a.renderer.resize(nw, nh);
          
          // Re-fit model
          m.position.set(0, 0);
          m.scale.set(1, 1);
          const b = m.getBounds();
          if (b && b.width > 0 && b.height > 0) {
            const s = Math.min(nw / b.width, nh / b.height) * 0.85;
            m.scale.set(s, s);
            const nb = m.getBounds();
            m.x = (nw / 2) - (nb.x + nb.width / 2);
            m.y = (nh / 2) - (nb.y + nb.height / 2) + nh * 0.04;
          }
        };
        const resizeObs = new ResizeObserver(onResize);
        resizeObs.observe(container);

        setLoading(false);
        console.log('[Live2D] Model ready');

        // Cleanup function stored for later
        return () => {
          mounted = false;
          document.removeEventListener('pointermove', onPointerMove);
          resizeObs.disconnect();
        };

      } catch (err) {
        console.error('[Live2D] Init error:', err);
        if (mounted) {
          setError(String(err));
          setLoading(false);
        }
      }
    };

    let cleanup: (() => void) | undefined;
    init().then(fn => { cleanup = fn; });

    // Unmount cleanup
    return () => {
      mounted = false;
      cleanup?.();
      
      if (modelRef.current) {
        try {
          pixiAppRef.current?.stage?.removeChild(modelRef.current);
          modelRef.current.destroy();
        } catch {}
        modelRef.current = null;
      }
      
      if (pixiAppRef.current) {
        try {
          pixiAppRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch {}
        pixiAppRef.current = null;
      }
      
      // Remove canvas
      const canvas = container.querySelector('canvas');
      if (canvas) canvas.remove();
    };
  }, [discoverExpressionParams]);

  // ==========================================
  // Expression effect - separate from init
  // ==========================================
  useEffect(() => {
    if (loading || error) return;
    applyExpression(expression || null);
  }, [expression, loading, error, applyExpression]);

  // ==========================================
  // Click handler
  // ==========================================
  const handleClick = useCallback(() => {
    onContainerClick?.();
  }, [onContainerClick]);

  // ==========================================
  // Render
  // ==========================================
  return (
    <div 
      ref={containerRef} 
      className={cn('w-full h-full relative cursor-pointer')}
      onClick={handleClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-darker/80 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-glorpi-mint animate-spin" />
            <span className="text-xs text-ink-muted">Loading Glorpi...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-darker/95 rounded-2xl p-4">
          <div className="text-center">
            <p className="text-sm text-validation-error mb-2">Live2D Error</p>
            <p className="text-xs text-ink-muted">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
