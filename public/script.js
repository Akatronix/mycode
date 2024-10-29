const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startButton = document.getElementById("startButton");

let localStream;
let peerConnection;

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Public STUN server
};

const socket = io("http://localhost:10000");
// const socket = io("https://smart-iot-irrigation-system.onrender.com");

// Handle signaling data from server
socket.on("offer", async (data) => {
  if (!peerConnection) createPeerConnection();
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", { answer });
});

socket.on("answer", async (data) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );
});

socket.on("ice-candidate", (data) => {
  if (data.candidate)
    peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
});

// Get user media and initiate call
async function startCall() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localVideo.srcObject = localStream;

  createPeerConnection();
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", { offer });
}

// Create peer connection and set up event handlers
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate)
      socket.emit("ice-candidate", { candidate: event.candidate });
  };
}

// Start button click event
startButton.addEventListener("click", startCall);
// startCall();
