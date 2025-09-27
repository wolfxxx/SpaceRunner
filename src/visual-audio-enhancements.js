// Visual & Audio Enhancement Package for Space Runner 2
// Advanced particle effects, procedural sound synthesis, visual feedback systems

/* global window */

// === ADVANCED PARTICLE SYSTEMS ===
const ParticleEffectsSystem = (() => {
  const PARTICLE_TYPES = {
    SPARKS: {
      name: 'sparks',
      duration: { min: 800, max: 1200 },
      velocity: { min: 40, max: 80 },
      size: { min: 1.5, max: 3.5 },
      colors: [0xff6600, 0xffaa00, 0xffff00],
      directionRange: [0.3, 5.8], 
      blendMode: 'ADD'
    },
    EXPLOSION: {
      name: 'explosion',
      duration: { min: 1500, max: 2000 },
      velocity: { min: 60, max: 120 },
      size: { min: 2, max: 4 },
      colors: [0xff0044, 0xff8800, 0xffaa00],
      directionRange: [0, 6.28],
      blendMode: 'ADD'
    },
    NEON_TRAIL: {
      name: 'neon_trail', 
      duration: { min: 200, max: 400 },
      velocity: { min: 40, max: 70 },
      size: { min: 1, max: 2.5 },
      colors: [0x00ffff, 0x0055ff, 0x0066cc],
      directionRange: [0, 6.28],
      blendMode: 'ADD'
    }
  };

  function createExplosionEffect(scene, x, y, intensity = 1) {
    const baseConfig = PARTICLE_TYPES.EXPLOSION;
    const particleCount = Math.floor(12 + Math.random() * 8) * intensity;
    
    scene.time.delayedCall(0, () => {
      for (let i = 0; i < particleCount; i++) {
        createParticle(scene, {
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          color: baseConfig.colors[Math.floor(Math.random() * baseConfig.colors.length)],
          velocityX: (Math.random() - 0.5) * baseConfig.velocity.max * 1.6,
          velocityY: (Math.random() - 0.5) * baseConfig.velocity.max * 1.6,
          size: (Math.random() * (baseConfig.size.max - baseConfig.size.min)) + baseConfig.size.min,
          duration: Math.random() * (baseConfig.duration.max - baseConfig.duration.min) + baseConfig.duration.min,
          fadeToAlpha: 0
        });
      }
    });
  }

  function createBulletTrail(scene, bullet) {
    let trailInterval = setInterval(() => {
      if (!bullet || !bullet.active) {
        clearInterval(trailInterval);
        return;
      }
      
      scene.time.delayedCall(120, () => {
        const trailParticle = createParticle(scene, {
          x: bullet.x + Math.cos(bullet.rotation + 1.5708) * 25,
          y: bullet.y + Math.sin(bullet.rotation + 1.5708) * 25,
          color: PARTICLE_TYPES.NEON_TRAIL.colors[Math.floor(Math.random() * PARTICLE_TYPES.NEON_TRAIL.colors.length)],
          velocityX: 0,
          velocityY: 0,
          size: 1 + Math.random(),
          duration: PARTICLE_TYPES.NEON_TRAIL.duration.min,
          fadeToAlpha: 0.85
        });
      });
    }, 120);
  }

  function createParticle(scene, config, blendMode = 'normal') {
    const particle = scene.add.graphics();
    const circle = particle.createGraphics();
    circle.beginFill(config.color);
    circle.drawCircle(0, 0, config.size);
    circle.endFill();
    
    const shapeSprite = scene.add.sprite(config.x, config.y);
    scene.time.delayedCall(100, () => {
      if (shapeSprite.element) {
        shapeSprite.setPosition(shapeSprite.x + config.velocityX * 0.6, shapeSprite.y + config.velocityY * 0.6);
      }
    });
    
    scene.tweens.add({
      targets: shapeSprite,
      alpha: config.fadeToAlpha || 0,
      duration: config.duration || 2500,
      ease: 'power1.easeOut',
      onComplete: () => {
        if (shapeSprite && shapeSprite.destroy) shapeSprite.destroy();
      }
    });
    
    return { shapeSprite, particle };
  }
  
  return {
    createExplosionEffect,
    createBulletTrail,
    PARTICLE_TYPES
  };
})();

// === ADAPTIVE AUDIO SYSTEM ===
const AdaptiveAudio = (() => {
  let audioSettings = {
    musicMaster: 1.0,
    sfxMaster: 1.0,
    reverbAmount: 0.0,
    bpmSync: true
  };

  function createEnhancedSFX(scene) {
    // Add dynamic sound based on gameplay events
    return {
      fireCombo: (level) => {
        // Generate higher pitches for higher combos
        const freq = 300 + level * 150;
        scene.add.sound({ frequency: freq, duration: 0.1 });
      },
      
      shieldHit: () => {
        // Electrical fizz sound
        scene.add.sound({ frequency: 800, type: 'square', envelope: 'decay' });
      },
      
      bossWarning: () => {
        // Scary buildup sound
        const frequencies = [100, 200, 300];
        frequencies.forEach((f, i) => {
          scene.time.delayedCall(i * 100, () => {
            scene.add.sound({ frequency: f, duration: 0.5 });
          });
        });
      }
    };
  }

  return {
    audioSettings,
    createEnhancedSFX
  };
})();

// === DYNAMIC LIGHTING SYSTEM ===
const DynamicLighting = (() => {
  function addShieldLighting(scene, sprite, radius = 100, color = 0xff55aa) {
    if (!scene || !sprite) return;
    
    const lightEffect = scene.add.graphics();
    lightEffect.lineStyle(2, color, 0.6);
    lightEffect.circle(sprite.x, sprite.y, radius);
    
    // Rotating glow effect
    scene.tweens.add({
      targets: lightEffect,
      scaleX: { from: 0.8, to: 1.2 },
      scaleY: { from: 0.8, to: 1.2 },
      alpha: { from: 0.3, to: 0.8 },
      duration: 1000,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true
    });
    
    return lightEffect;
  }

  function addPulseEffect(scene, sprite, intensity = 10) {
    return scene.tweens.add({
      targets: sprite,
      scaleX: { from: sprite.scaleX, to: sprite.scaleX + 0.2 },
      scaleY: { from: sprite.scaleY, to: sprite.scaleY + 0.2 },
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: intensity
    });
  }

  function createScreenShake(scene, intensity = 10, duration = 1000) {
    const originalCamera = { x: scene.cameras.main.x, y: scene.cameras.main.y };
    
    return scene.tweens.add({
      targets: scene.cameras.main,
      x: originalCamera.x,
      y: originalCamera.y,
      duration: duration,
      ease: 'Linear',
      onUpdate: function() {
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        scene.cameras.main.x = scene.cameras.main.x + shakeX;
        scene.cameras.main.y = scene.cameras.main.y + shakeY;
      },
      onComplete: function() {
        scene.cameras.main.x = originalCamera.x;
        scene.cameras.main.y = originalCamera.y;
      }
    });
  }

  return {
    addShieldLighting,
    addPulseEffect,
    createScreenShake
  };
})();

// === CAMERA EFFECTS SYSTEM ===
const CameraEffects = (() => {
  function blurTransition(fadeScene) {
    const blurFilter = {
      type: 'Blur',
      strenghts: [2, 4, 6]
    };
    
    const blurTween = fadeScene.tweens.add({
      targets: blurFilter,
      strength: { from: 2, to: 16, duration: 1000 },
      onComplete: () => { blurFilter.strength = 0; }
    });
    
    return blurTween;
  }

  function addTrackingCamera(followTarget, scene) {
    if (!followTarget) return;
    
    // Smooth camera following for dynamic viewports
    scene.cameras.main.startFollow(followTarget, true, 1, 1, undefined, undefined, {
      minZoom: 0.5,
      maxZoom: 2.0
    });
    
    // Zoom in when combat starts
    scene.events.on('combat-start', () => {
      scene.cameras.main.setZoom(1.2);
    });
    
    scene.events.on('combat-end', () => {
      scene.cameras.main.setZoom(1.0);
    });
    
    return scene.cameras.main;
  }

  return { blurTransition, addTrackingCamera };
})();

// Export for game integration
if (typeof window !== 'undefined') {
  window.ParticleEffectsSystem = ParticleEffectsSystem;
  window.AdaptiveAudio = AdaptiveAudio;
  window.DynamicLighting = DynamicLighting;
  window.CameraEffects = CameraEffects;
}