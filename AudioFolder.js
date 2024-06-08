/** @format */

function addFiles(filePath, num) {
  const audioList = [];

  for (let i = 1; i <= num; i++) {
    const fileName = `${i}.mp3`;
    const fullPath = `${filePath}/${fileName}`;
    const audio = new Audio(fullPath);

    audioList.push({ fileName, audio });
  }

  return audioList;
}

function addDrum(filePath, num) {
  const snare = addFiles(filePath + "/snare", num);
  const cymbal = addFiles(filePath + "/cymbal", num);
  const kick = addFiles(filePath + "/kick", num);
  const all = [...snare, ...kick, ...cymbal];
  return all;
}

function addInstrument(filePath, num) {
  const slow = addFiles(filePath + "/slow", num);
  const fast = addFiles(filePath + "/fast", num);
  return { slow, fast };
}

/** @format */

class AudioFolder {
  constructor(filePath) {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.allAudio = [];

    this.trackCount = 0;

    this.base = addInstrument(filePath + "/base", 3);
    this.harm = addInstrument(filePath + "/harm", 5);

    this.trombone = addInstrument(filePath + "/melody/TBone", 3);
    this.voc = addInstrument(filePath + "/melody/voc", 3);
    this.melody = { trombone: this.trombone, voc: this.voc };

    this.fill = addFiles(filePath + "/fill", 3);

    this.slowDrum = addDrum(filePath + "/drums/slow", 3);
    this.fastDrum = addDrum(filePath + "/drums/fast", 3);
    this.drums = { slow: this.slowDrum, fast: this.fastDrum };

    this.initializeAllAudio();
  }

  initializeAllAudio() {
    this.allAudio = [
      ...this.base.slow,
      ...this.base.fast,
      ...this.harm.slow,
      ...this.harm.fast,
      ...this.melody.trombone.slow,
      ...this.melody.trombone.fast,
      ...this.melody.voc.slow,
      ...this.melody.voc.fast,
      ...this.fill,
      ...this.drums.slow,
      ...this.drums.fast,
    ];

    const promises = this.allAudio.map(
      ({ audio }) =>
        new Promise((resolve) => {
          audio.addEventListener("canplaythrough", resolve, { once: true });
        })
    );

    Promise.all(promises).then(() => {
      console.log("All audio files are ready to play.");
    });
  }

  start() {
    const startTime = this.audioContext.currentTime;
    const sources = [];

    // Create media element sources and connect to destination
    this.allAudio.forEach(({ audio }) => {
      const source = this.audioContext.createMediaElementSource(audio);
      source.connect(this.audioContext.destination);
      sources.push(source);
      audio.muted = true; // Start with all audio muted

      // Ensure seamless looping
      audio.addEventListener("timeupdate", () => {
        const buffer = (30 - this.trackCount) / 100; // Adjust buffer time to ensure smooth looping

        if (audio.currentTime > audio.duration - buffer) {
          let tmp = false;
          if (audio.muted == false) {
            audio.muted = true;
            tmp = true;
          }
          audio.currentTime = 0;
          if (tmp == true) {
            audio.muted = false;
          }

          audio.play();
          tmp = false;
        }
      });
    });

    // Ensure all audios start at the same time
    const playPromise = this.audioContext.resume();

    playPromise
      .then(() => {
        this.allAudio.forEach(({ audio }) => {
          audio.currentTime = 0;
          audio.play().catch((error) => {
            console.error(`Error playing audio: ${error}`);
          });
        });
      })
      .catch((error) => {
        console.error(`Error resuming audio context: ${error}`);
      });
  }

  muteAll() {
    this.allAudio.forEach(({ audio }) => {
      audio.muted = true;
    });
  }

  unmuteAll() {
    this.allAudio.forEach(({ audio }) => {
      audio.muted = false;
    });
  }

  mute(instrument, speed) {
    let instrumentList;
    if (instrument === "base") {
      instrumentList = this.base[speed];
    } else if (instrument === "harm") {
      instrumentList = this.harm[speed];
    } else if (instrument === "trombone") {
      instrumentList = this.melody.trombone[speed];
    } else if (instrument === "voc") {
      instrumentList = this.melody.voc[speed];
    } else if (instrument === "fill") {
      instrumentList = this.fill;
    } else if (instrument === "drum") {
      instrumentList = this.drums[speed];
    }

    instrumentList.forEach(({ audio }) => {
      audio.muted = true;
    });
  }

  unmute(instrument, speed, size) {
    this.trackCount += 1;
    let instrumentList;
    if (instrument === "base") {
      instrumentList = this.base[speed];
    } else if (instrument === "harm") {
      instrumentList = this.harm[speed];
    } else if (instrument === "trombone") {
      instrumentList = this.melody.trombone[speed];
    } else if (instrument === "voc") {
      instrumentList = this.melody.voc[speed];
    } else if (instrument === "fill") {
      instrumentList = this.fill;
    } else if (instrument === "drum") {
      instrumentList = this.drums[speed];
    }

    // // Mute all first
    // instrumentList.forEach(({ audio }) => {
    //   audio.muted = true;
    // });

    // Unmute a random audio from the list
    const randomIndex = Math.floor(Math.random() * instrumentList.length);
    instrumentList[randomIndex].audio.muted = false;
    console.log(Math.floor((size / 20) * 10));
    instrumentList[randomIndex].audio.volume =
      Math.floor((size / 20) * 10) / 10;
  }

  // New method to mute all tracks of a specific instrument type
  muteAllOfInstrument(instrumentType) {
    const instrumentGroups = {
      base: [...this.base.slow, ...this.base.fast],
      harm: [...this.harm.slow, ...this.harm.fast],
      trombone: [...this.melody.trombone.slow, ...this.melody.trombone.fast],
      voc: [...this.melody.voc.slow, ...this.melody.voc.fast],
      fill: this.fill,
      drum: [...this.drums.slow, ...this.drums.fast],
    };

    const instrumentList = instrumentGroups[instrumentType];

    if (instrumentList) {
      instrumentList.forEach(({ audio }) => {
        audio.muted = true;
      });
    } else {
      console.error(`Instrument type "${instrumentType}" not found.`);
    }
  }
}

// Example usage
const folder = new AudioFolder("./music");

// Link the start function to the button
document.getElementById("startButton").addEventListener("click", () => {
  folder.start();
});
