// Ephemeral same-browser signaling for WebRTC verification. No backend identity or cross-device join.
const $ = id => document.getElementById(id);
const key = location.hash.slice(1);
const host = !key;
const room = host ? crypto.randomUUID() : key;
if (!/^[a-f0-9-]{36}$/i.test(room)) throw Error("Invalid local invitation");
const bus = new BroadcastChannel("elyora-local-audio-" + room);
const self = crypto.randomUUID();
let partner, media, peer, inRoom = false, joining = false, generation = 0;
const tell = (type, data = null) => bus.postMessage({ type, from:self, to:partner, data });
const status = (code, label) => { $("state").dataset.status=code; $("state").textContent=label; };
$("listen").hidden=host;
if (host) { $("guest").href = "/#" + room; $("guest").hidden = false; }

function reset(notify = true) {
  generation++;
  if (notify && partner) tell("leave");
  if (peer) { peer.onconnectionstatechange=null; peer.close(); }
  for (const track of media?.getTracks() ?? []) track.stop();
  peer=null; media=null; partner=null; inRoom=false; joining=false;
  $("listen").disabled=false; $("remote").srcObject=null; $("join").disabled=false; $("leave").disabled=true; $("mute").disabled=true;
  $("mute").setAttribute("aria-pressed","false");
  status("left","مکالمه پایان یافت. می‌توانید دوباره وارد شوید.");
}

async function describe(connection, description) {
  await connection.setLocalDescription(description);
  // Exchange one complete local description including ICE candidates.
  if (connection.iceGatheringState !== "complete") {
    await new Promise((resolve,reject) => {
      const timer=setTimeout(() => finish(false),8000);
      function finish(ok) {
        clearTimeout(timer);
        connection.removeEventListener("icegatheringstatechange",check);
        if (ok) resolve(); else reject(Error("ICE timeout"));
      }
      function check() { if (connection.iceGatheringState === "complete") finish(true); }
      connection.addEventListener("icegatheringstatechange",check);
      check();
    });
  }
  return connection.localDescription.toJSON();
}
function connect() {
  const connection = new RTCPeerConnection({iceServers:[]});
  peer=connection;
  if (media) for (const track of media.getAudioTracks()) connection.addTrack(track,media);
  else connection.addTransceiver("audio",{direction:"recvonly"});
  connection.ontrack = event => { $("remote").srcObject=event.streams[0]; };
  connection.onconnectionstatechange = () => {
    if (connection.connectionState === "connected") status("connected","صدا وصل شد.");
    if (connection.connectionState === "failed") reset();
  };
  return connection;
}

bus.onmessage = async ({data:msg}) => {
  if (!inRoom || (msg.to && msg.to !== self) || (partner && partner !== msg.from)) return;
  const current=generation;
  try {
    if (msg.type === "ready" && host && !peer) {
      partner=msg.from;
      const connection=connect();
      const offer=await describe(connection,await connection.createOffer());
      if (generation===current) tell("offer",offer);
    } else if (msg.type === "waiting" && !host && !peer) tell("ready");
    else if (msg.type === "offer" && !host && !peer) {
      partner=msg.from;
      const connection=connect();
      await connection.setRemoteDescription(msg.data);
      const answer=await describe(connection,await connection.createAnswer());
      if (generation===current) tell("answer",answer);
    } else if (msg.type === "answer" && host && peer?.signalingState === "have-local-offer") await peer.setRemoteDescription(msg.data);
    else if (msg.type === "leave" && partner === msg.from) reset(false);
  } catch { if (generation===current) { reset(); status("error","اتصال برقرار نشد. دوباره امتحان کنید."); } }
};

async function join(withMicrophone) {
  if (inRoom || joining) return;
  joining=true;
  const current=++generation;
  $("join").disabled=true; $("listen").disabled=true; $("leave").disabled=false;
  try {
    const stream=withMicrophone ? await navigator.mediaDevices.getUserMedia({audio:true,video:false}) : null;
    if (generation!==current) { stream?.getTracks().forEach(t=>t.stop()); return; }
    media=stream; inRoom=true; joining=false; $("mute").disabled=!withMicrophone;
    status("waiting","منتظر همراه…");
    tell(host ? "waiting" : "ready");
  } catch { if (generation===current) { reset(); status("unavailable","میکروفن در دسترس نیست. اجازهٔ مرورگر و دستگاه را بررسی کنید."); } }
}
$("join").onclick=()=>join(true);
$("listen").onclick=()=>join(false);
$("mute").onclick=() => {
  if (!media) return;
  const muted=$("mute").getAttribute("aria-pressed")!=="true";
  media.getAudioTracks().forEach(track=>{track.enabled=!muted;});
  $("mute").setAttribute("aria-pressed",String(muted));
};
$("leave").onclick=()=>reset();
window.addEventListener("pagehide",()=>{reset();bus.close();});
