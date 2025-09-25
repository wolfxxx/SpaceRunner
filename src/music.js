const Music = (() => {
  let music;
  let currentVolume = 0.00390625; // Default volume (halved)

  function init(scene) {
    // Music by UFO-Man from Pixabay
    // https://pixabay.com/music/techno-trance-space-invaders-13809/
    scene.load.audio('level1', 'src/assets/music/level1.mp3');

    // Music by MaxKoMusic from Pixabay
    // https://pixabay.com/music/epic-cinematic-the-last-stand-13886/
    scene.load.audio('level2', 'src/assets/music/level2.mp3');

    // Music by WinnieTheMoog from Pixabay
    // https://pixabay.com/music/video-games-epic-boss-battle-15242/
    scene.load.audio('boss', 'src/assets/music/boss.mp3');
  }

  function play(scene, track) {
    if (music) {
      music.stop();
    }
    music = scene.sound.add(track);
    music.play({loop: true, volume: currentVolume});
  }

  function stop() {
    if (music) {
      music.stop();
    }
  }

  function setVolume(value) {
    currentVolume = value;
    if (music) {
      music.volume = currentVolume;
    }
  }

  return {
    init,
    play,
    stop,
    setVolume,
  };
})();
