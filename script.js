const r = document.getElementById("range");
const p = document.getElementById("progress");

const playbackRange = document.getElementById("playbackRange");
const playbackProgress = document.getElementById("playbackProgress");
const change = document.getElementById("change");

const next = document.querySelector(".next");
const loop = document.querySelector(".loop");

const search = document.getElementById("search");

let posX = 0;
let isSeeking = false;

const songs = [
  "music/Better Now.mp3",
  "music/Blinding Lights.mp3",
  "music/Borderline.mp3",
  "music/Bye Bye Bye.mp3",
  "music/Caramel.mp3",
  "music/Dhupchaya.mp3",
  "music/Duvet.mp3",
  "music/Heroes Tonight.mp3",
  "music/Instant Crush.mp3",
  "music/Maya.mp3",
  "music/Mortals.mp3",
  "music/Tumi Jaio Na.mp3",
];

const queue = [];

function vol() {
  p.value = r.value;
}

function playPause() {
  if (audio.paused) {
    audio.play();
    change.src = "sprites/pause.svg";
    change.style.transform = "translateX(-0.5px)";
  } else {
    audio.pause();
    change.src = "sprites/play.svg";
    change.style.transform = "translateX(4px)";
  }
}

async function createPlaylistCard(file) {
  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Couldn't Load ${file}`);
    }

    const blob = await response.blob();

    jsmediatags.read(blob, {
      onSuccess: function (tag) {
        const title = tag.tags.title || "Unknown Title";
        const artist = tag.tags.artist || "Unknown Artist";
        const picture = tag.tags.picture;

        let cover = "sprites/coverDummy.jpg";

        if (picture) {
          const { data, format } = picture;

          let base64 = "";
          for (let i = 0; i < data.length; i++) {
            base64 += String.fromCharCode(data[i]);
          }

          cover = `data:${format};base64,${btoa(base64)}`;
        }

        const card = document.createElement("div");
        card.classList.add("playlistCards");
        card.innerHTML = `
          <div class="playlistNames">
            <h3>${title}</h3>
            <p>${artist}</p>
          </div>
          <div class="playlistCovers">
            <img src="${cover}" alt="${title}" />
            <div class="overlay" onclick="createQueueCard('${file}')">+</div>
          </div>
        `;

        document.querySelector("#playlist").appendChild(card);
      },

      onError: function (error) {
        console.error("Metadata Error", error);
      },
    });
  } catch (error) {
    console.error("File Loading error", error);
  }
}

async function createQueueCard(file) {
  if (queue.includes(file)) {
    return;
  }
  queue.push(file);

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Couldn't Load ${file}`);
    }

    const blob = await response.blob();

    jsmediatags.read(blob, {
      onSuccess: function (tag) {
        const title = tag.tags.title || "Unknown Title";
        const artist = tag.tags.artist || "Unknown Artist";
        const picture = tag.tags.picture;

        let cover = "sprites/coverDummy.jpg";

        if (picture) {
          const { data, format } = picture;

          let base64 = "";
          for (let i = 0; i < data.length; i++) {
            base64 += String.fromCharCode(data[i]);
          }

          cover = `data:${format};base64,${btoa(base64)}`;
        }

        const card = document.createElement("div");
        card.classList.add("queueCards");
        card.dataset.file = file;
        card.innerHTML = `
          <div class="queueNames">
            <h3>${title}</h3>
            <p>${artist}</p>
            <div class="queueControls">
              <button class="deleteQueue">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <!--!Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                  <path
                    fill="#674441"
                    d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="queueCovers">
            <img src="${cover}" alt="${title}" />
            </div>
            `;

        document.querySelector("#queue").appendChild(card);

        const deleteBtn = card.querySelector(".deleteQueue");
        deleteBtn.addEventListener("click", () => {
          removeFromQueue(card.dataset.file, card);
        });

        if (queue.length === 1) {
          updateMiddle(title, artist, cover);
          playCurrent();
        }
      },

      onError: function (error) {
        console.error("Metadata Error", error);
      },
    });
  } catch (error) {
    console.error("File Loading error", error);

    queue.splice(queue.indexOf(file), 1);
  }
}

let audio = new Audio();
let looping = false;

async function playCurrent() {
  if (queue.length === 0) {
    audio.pause();
    audio.src = "";

    change.src = "sprites/play.svg";
    change.style.transform = "translateX(-0.5px)";
    playbackRange.value = 0;
    playbackProgress.value = 0;

    document.getElementById("title").textContent = "No Song Playing";
    document.getElementById("artist").textContent = "Unknown Artist";
    document.getElementById("cover").src = "sprites/coverDummy.jpg";

    return;
  }

  const file = queue[0];

  try {
    const response = await fetch(file);
    const blob = await response.blob();

    jsmediatags.read(blob, {
      onSuccess: function (tag) {
        const title = tag.tags.title || "Unknown Title";
        const artist = tag.tags.artist || "Unknown Artist";
        const picture = tag.tags.picture;

        let cover = "sprites/coverDummy.jpg";

        if (picture) {
          const { data, format } = picture;

          let base64 = "";
          for (let i = 0; i < data.length; i++) {
            base64 += String.fromCharCode(data[i]);
          }

          cover = `data:${format};base64,${btoa(base64)}`;
        }

        updateMiddle(title, artist, cover);
      },

      onError: function (error) {
        console.error("Metadata Error", error);
      },
    });
    audio.src = queue[0];
    playbackRange.value = 0;
    playbackProgress.value = 0;
    audio.play();

    change.src = "sprites/pause.svg";
    change.style.transform = "translateX(-0.5px)";
  } catch (error) {
    console.error("File Loading error", error);
  }
}

function removeFirstCard() {
  const queueContainer = document.querySelector("#queue");
  const firstCard = queueContainer.querySelector(".queueCards");

  if (firstCard) {
    firstCard.remove();
  }
}

function skipToNext() {
  if (queue.length === 0) return;

  queue.shift();
  removeFirstCard();
  playCurrent();
}

function updateMiddle(title, artist, cover) {
  document.getElementById("title").textContent = title;
  document.getElementById("artist").textContent = artist;
  document.getElementById("cover").src = cover;
}

function removeFromQueue(file, card) {
  const index = queue.indexOf(file);

  if (index === -1) return;

  queue.splice(index, 1);
  card.remove();

  if (index === 0) {
    playCurrent();
  }
}

songs.forEach(createPlaylistCard);

search.addEventListener("input", () => {
  const text = search.value.toLowerCase().trim();
  const cards = document.querySelectorAll(".playlistCards");

  cards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const artist = card.querySelector("p").textContent.toLowerCase();

    if (title.includes(text) || artist.includes(text)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
});

// createQueueCard("music/Mortals.mp3");

next.addEventListener("click", skipToNext);

loop.addEventListener("click", () => {
  looping = !looping;
  audio.loop = looping;

  loop.querySelector("img").src = looping
    ? "sprites/looped.svg"
    : "sprites/loop.svg";
});

audio.addEventListener("ended", skipToNext);

audio.addEventListener("timeupdate", () => {
  if (!isSeeking && audio.duration) {
    playbackRange.value = (audio.currentTime / audio.duration) * 100;
    playbackProgress.value = playbackRange.value;
  }
});

playbackRange.addEventListener("mousedown", () => {
  isSeeking = true;
});

playbackRange.addEventListener("input", () => {
  playbackProgress.value = playbackRange.value;
});

playbackRange.addEventListener("mouseup", () => {
  const time = (playbackRange.value / 100) * audio.duration;
  audio.currentTime = time;
  playbackProgress.value = playbackRange.value;
  isSeeking = false;
});

r.addEventListener("input", () => {
  audio.volume = r.value / 100;
});
