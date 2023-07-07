const startBtn = document.querySelector("#startBtn");
const video = document.querySelector("#preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "MyRecording.webm";
  document.body.appendChild(a);
  a.click();
};

const handleStopBtn = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStopBtn);
  startBtn.addEventListener("click", handleDownload);

  recorder.stop();
};

const handleStartBtn = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStartBtn);
  startBtn.addEventListener("click", handleStopBtn);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    // createObjectURL 브라우저 메모리에서만 가능한 url을 만들어줌
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  // mediaDevices는 미디어 장비들에 접근할 수 있게 함
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 400, height: 400 },
  });
  video.srcObject = stream;
  video.play();
};

init();
startBtn.addEventListener("click", handleStartBtn);
