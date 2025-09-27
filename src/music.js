const Music = (() => {
  let music;
  let currentVolume = 0.00390625; // Default volume (halved)

  function init(scene) {
    try {
      console.log('[Music] Initializing music...');
      
      // Using copied files that now exist. Just assets/music from base href "src/"
      scene.load.audio('level1', 'assets/music/level1.mp3');
      scene.load.on('fileerror', (file) => {
        console.warn('[Music] level1.mp3 failed to load, path:', file.key);
      });
      
      scene.load.audio('level2', 'assets/music/level2.mp3');
      scene.load.on('fileerror', (file) => {
        console.warn('[Music] level2.mp3 failed to load, path:', file.key);
      });
      
      scene.load.audio('boss', 'assets/music/boss.mp3');
      scene.load.on('fileerror', (file) => {
        console.warn('[Music] boss.mp3 failed to load, path:', file.key);
      });
      
      console.log('[Music] Music initialization completed successfully');
    } catch (err) {
      console.warn('[Music] Failed to initialize music:', err);
    }
  }

  function play(scene, track, volume = null) {
    try {
      // Stop current music if anything playing
      if (music) {
        music.stop();
        music = null;
      }
      // Use provided volume or current volume, but ensure it's reasonable
      const playVolume = volume !== null ? Math.min(volume, 0.1) : Math.min(currentVolume, 0.1);
      
      console.log('[Music] Attempting to play:', track, 'at volume:', playVolume);
      
      // Debug: check if files loaded in cache
      if (scene.cache && scene.cache.audio) {
        console.log('[Music] Cache status:', {
          'audioCacheExists': !!scene.cache.audio.entries,
          'audioEntries': Object.keys(scene.cache.audio.entries || {}),
          'requestedTrackExists': scene.cache.audio.exists(track),
        });
      }

      // Wait for files to load if cache still building
      if (scene.cache && scene.cache.audio && !scene.cache.audio.exists(track)) {
        console.log('[Music] Track not cached yet. Waiting for load to complete...');
        setTimeout(() => play(scene, track, volume), 1000);
        return;
      }
      
      try {
        music = scene.sound.add(track, { loop: true, volume: playVolume });
        music.play();
        console.log('[Music] Successfully started track:', track);
      } catch (playErr) {
        console.warn('[Music] Audio locked by browser autoplay policy:', playErr.message);
        
        // Attempt browser unlock for audio
        if (scene.sound && scene.sound.unlock) {
          try {
            scene.sound.unlock();
          } catch(e) { /* Browser continues to block until user interaction */ }
        }
        
        // Try again after unlock attempt
        try { 
          music && music.play(); 
        } catch(lockError) {
          console.warn('[Music] Audio will play after user clicks/taps anywhere in the page');
          console.warn('[Music] Available cached tracks:', Object.keys(scene.cache && scene.cache.audio ? scene.cache.audio.entries : {}));
        }
      }
    } catch(err) { 
      console.warn('[Music] Play top-level failure:', err.message);
    }
  }

  function stop() {
    if (music) {
      music.stop();
    }
  }

  function setVolume(value) {
    currentVolume = value;
    if (music && music.isPlaying) {
      // Only update volume if music is actually playing
      try {
        music.volume = currentVolume;
        console.log('[Music] Volume updated to:', currentVolume);
      } catch (err) {
        console.warn('[Music] Failed to update volume:', err);
      }
    }
  }

  return {
    init,
    play,
    stop,
    setVolume,
  };
})();
