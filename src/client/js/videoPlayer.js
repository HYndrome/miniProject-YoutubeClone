const video = document.querySelector("video");
const playBtn = document.querySelector("#play");
const muteBtn = document.querySelector("#mute");
const volumeRange = document.querySelector("#volume");
const currentTime = document.querySelector("#currentTime");
const totalTime = document.querySelector("#totalTime");
const timeline = document.querySelector("#timeline");
const fullscreenBtn = document.querySelector("#fullscreen");
const videoContainer = document.querySelector("#videoContainer");
const videoControls = document.querySelector("#videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;
const handlePlayClick = (e) => {
  // if the video is playing, pause it
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(11, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreenBtn = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    fullscreenBtn.innerText = "Exit Full Screen";
  } else {
    fullscreenBtn.innerText = "Enter Full Screen";
  }
};

const hideControl = () => {
  videoControls.classList.remove("showing");
};

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  // 움직임을 감지하는 구문
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControl, 3000);
};

const handleMouseLeave = () => {
  // mouse가 video창을 나간 뒤 delay를 주고 싶음
  controlsTimeout = setTimeout(hideControl, 3000);
};

const handleEnded = () => {
  // 요청 보내기
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
// [새로고침을 연속으로 했을 때 totalTime이 바뀌지 않는 문제 해결]
video.readyState
  ? handleLoadedMetadata()
  : video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
fullscreenBtn.addEventListener("click", handleFullscreenBtn);
// 전체 화면을 변경할 경우에 발생하는 이벤트
video.addEventListener("mousemove", handleMouseMove);
document.addEventListener("fullscreenchange", handleFullscreen);
video.addEventListener("mouseleave", handleMouseLeave);
// video 시청 끝냈을 경우
video.addEventListener("ended", handleEnded);
