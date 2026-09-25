const r = document.getElementById("range");
const p = document.getElementById("progress");

const playbackRange = document.getElementById("playbackRange");
const playbackProgress = document.getElementById("playbackProgress");

function vol() {
  p.value = r.value;
  playbackProgress.value = playbackRange.value;
}
