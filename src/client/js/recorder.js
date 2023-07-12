import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.querySelector("#actionBtn");
const video = document.querySelector("#preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  // 가상의 컴퓨터에서 파일을 생성
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
  // ffmpeg를 사용자의 브라우저에서 로딩, 아래 명령어를 사용자의 브라우저에서 실행가능
  // 인코딩
  await ffmpeg.run("-i", files.input, "-r", "60", files.output);
  // thumbnail 캡쳐
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );
  // 파일 읽기
  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);
  // readFile의 return 값은 Uint8Array
  // 실제 파일 접근을 위한 buffer
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
  // Blob은 파일 같은 개념
  // 생성한 mp4Blob으로 createObjectURL
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);
  // 해당 url은 브라우저를 닫기까지 존재

  downloadFile(mp4Url, "MyRecording.mp4");

  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(videoFile);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStartBtn);
};

const handleStopBtn = () => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStopBtn);
  actionBtn.addEventListener("click", handleDownload);

  recorder.stop();
};

const handleStartBtn = () => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStartBtn);
  actionBtn.addEventListener("click", handleStopBtn);

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
    video: { width: 1024, height: 576 },
  });
  video.srcObject = stream;
  video.play();
};

init();
actionBtn.addEventListener("click", handleStartBtn);
