'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlorpiLive2DProps {
  mood?: 'happy' | 'thinking' | 'concerned' | 'excited';
  className?: string;
}

// Fallback avatar component when Live2D fails to load
function FallbackAvatar({ mood }: { mood: string }) {
  const moodEmoji = {
    happy: '😊',
    thinking: '🤔',
    concerned: '😟',
    excited: '✨',
  }[mood] || '😊';

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-glorpi-mint/20 to-accent-orange/10 rounded-2xl"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="text-center">
        <motion.div
          className="w-24 h-24 mx-auto mb-2 rounded-full bg-glorpi-mint/30 flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span className="text-4xl">{moodEmoji}</span>
        </motion.div>
        <p className="text-xs text-ink-muted">Glorpi</p>
      </div>
    </motion.div>
  );
}

export function GlorpiLive2D({ mood = 'happy', className }: GlorpiLive2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const appRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePosition({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Update model parameters based on mouse position
  useEffect(() => {
    if (modelRef.current && isLoaded) {
      try {
        // These are common Live2D parameter names for eye/head tracking
        const model = modelRef.current;
        
        // Eye tracking
        if (model.internalModel?.coreModel) {
          const coreModel = model.internalModel.coreModel;
          
          // Try common parameter names
          const paramNames = {
            angleX: ['ParamAngleX', 'PARAM_ANGLE_X', 'param_angle_x'],
            angleY: ['ParamAngleY', 'PARAM_ANGLE_Y', 'param_angle_y'],
            angleZ: ['ParamAngleZ', 'PARAM_ANGLE_Z', 'param_angle_z'],
            bodyAngleX: ['ParamBodyAngleX', 'PARAM_BODY_ANGLE_X'],
            eyeBallX: ['ParamEyeBallX', 'PARAM_EYE_BALL_X'],
            eyeBallY: ['ParamEyeBallY', 'PARAM_EYE_BALL_Y'],
          };

          // Head/body follow
          const angleX = mousePosition.x * 30;
          const angleY = mousePosition.y * -30;
          
          // Try to set parameters with different naming conventions
          paramNames.angleX.forEach((name) => {
            try { coreModel.setParameterValueByIndex(coreModel.getParameterIndex(name), angleX); } catch {}
          });
          paramNames.angleY.forEach((name) => {
            try { coreModel.setParameterValueByIndex(coreModel.getParameterIndex(name), angleY); } catch {}
          });
          paramNames.bodyAngleX.forEach((name) => {
            try { coreModel.setParameterValueByIndex(coreModel.getParameterIndex(name), angleX * 0.5); } catch {}
          });
          paramNames.eyeBallX.forEach((name) => {
            try { coreModel.setParameterValueByIndex(coreModel.getParameterIndex(name), mousePosition.x); } catch {}
          });
          paramNames.eyeBallY.forEach((name) => {
            try { coreModel.setParameterValueByIndex(coreModel.getParameterIndex(name), mousePosition.y); } catch {}
          });
        }
      } catch (error) {
        // Silently fail for parameter updates
      }
    }
  }, [mousePosition, isLoaded]);

  // Initialize Live2D
  useEffect(() => {
    let mounted = true;

    const initLive2D = async () => {
      try {
        // Dynamically import PixiJS and pixi-live2d-display
        const PIXI = await import('pixi.js');
        const { Live2DModel } = await import('pixi-live2d-display');

        // Register the Live2DModel with PIXI
        (Live2DModel as any).registerTicker(PIXI.Ticker);

        if (!mounted || !canvasRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const canvas = canvasRef.current;

        // Create PIXI application
        const app = new PIXI.Application({
          view: canvas,
          width: container.clientWidth,
          height: container.clientHeight,
          backgroundAlpha: 0,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        appRef.current = app;

        // Load the model
        const model = await Live2DModel.from('/glorpi_cat/glorpi_cat.model3.json', {
          autoInteract: false,
        });

        if (!mounted) {
          model.destroy();
          return;
        }

        modelRef.current = model;

        // Scale and position the model
        const scale = Math.min(
          container.clientWidth / model.width,
          container.clientHeight / model.height
        ) * 0.9;

        model.scale.set(scale);
        model.anchor.set(0.5, 0.5);
        model.position.set(container.clientWidth / 2, container.clientHeight / 2);

        // Add to stage (type assertion needed for Live2D compatibility)
        (app.stage.addChild as Function)(model);

        // Enable idle motion if available
        try {
          if (model.internalModel?.motionManager) {
            model.internalModel.motionManager.startRandomMotion('Idle', 2);
          }
        } catch {}

        setIsLoaded(true);
      } catch (error) {
        console.warn('Live2D loading failed:', error);
        if (mounted) {
          setHasError(true);
        }
      }
    };

    initLive2D();

    return () => {
      mounted = false;
      if (modelRef.current) {
        modelRef.current.destroy();
      }
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (appRef.current && containerRef.current && modelRef.current) {
        const container = containerRef.current;
        appRef.current.renderer.resize(container.clientWidth, container.clientHeight);

        const scale = Math.min(
          container.clientWidth / modelRef.current.width,
          container.clientHeight / modelRef.current.height
        ) * 0.9;

        modelRef.current.scale.set(scale);
        modelRef.current.position.set(container.clientWidth / 2, container.clientHeight / 2);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mood indicator
  const moodColors = {
    happy: 'bg-validation-success',
    thinking: 'bg-validation-info',
    concerned: 'bg-validation-warning',
    excited: 'bg-accent-orange',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-canvas-cream border border-blueprint-line',
        className
      )}
    >
      {/* Mood indicator */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <motion.div
          className={cn('w-3 h-3 rounded-full', moodColors[mood])}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-2xs text-ink-muted capitalize">{mood}</span>
      </div>

      {/* Canvas for Live2D */}
      <canvas
        ref={canvasRef}
        className={cn(
          'w-full h-full',
          !isLoaded && !hasError && 'opacity-0'
        )}
      />

      {/* Loading state */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-canvas-cream"
          >
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="w-12 h-12 rounded-full border-2 border-glorpi-mint border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-xs text-ink-muted">Loading Glorpi...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback on error */}
      {hasError && <FallbackAvatar mood={mood} />}
    </div>
  );
}
