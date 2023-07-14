
const endCallButton = document.querySelector('.call-option-end');

const callScreen: HTMLDivElement = document.querySelector(".call-screen");

async function startCall() {
    try {
      callScreen.classList.add('show');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  
      const localVideo: HTMLVideoElement = document.querySelector("#localVideo");
      localVideo.srcObject = stream;
      console.log(stream)
  
      // Twórz ofertę SDP (Session Description Protocol)
      const pc = new RTCPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  
      // Nasłuchuj sygnały ICE (Interactive Connectivity Establishment)
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Prześlij kandydatów ICE do drugiej osoby
          sendIceCandidate(event.candidate);
        }
      };
  
      // Uzyskaj ofertę SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
  
      // Prześlij ofertę SDP do drugiej osoby
      sendSignal('offer', offer);
  
      // Nasłuchuj sygnał odpowiedzi SDP od drugiej osoby
      rdb.ref('signal/answer').on('value', (snapshot: any) => {
        const answer = snapshot.val();
        if (answer) {
          pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });
  
      // Nasłuchuj sygnał kandydatów ICE od drugiej osoby
      rdb.ref('signal/iceCandidate').on('child_added', (snapshot: any) => {
        const iceCandidate = snapshot.val();
        if (iceCandidate) {
          pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
        }
      });
    } catch (error) {
      console.error("Błąd rozpoczynania rozmowy:", error);
    }
  }
  
  // Funkcja do przesyłania sygnału (oferty, odpowiedzi lub kandydata ICE) do drugiej osoby
  function sendSignal(signalType: any, signalData: any) {
    rdb.ref(`signal/${signalType}`).set(signalData);
  }
  
  async function joinRoom(roomId: any) {
    try {
      callScreen.classList.add('show');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  
      const localVideo: HTMLVideoElement = document.querySelector("#localVideo");
      localVideo.srcObject = stream;
      console.log(stream)
  
      // Twórz ofertę SDP (Session Description Protocol)
      const pc = new RTCPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  
      // Nasłuchuj sygnały ICE (Interactive Connectivity Establishment)
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Prześlij kandydatów ICE do drugiej osoby
          sendIceCandidate(event.candidate);
        }
      };
  
      // Uzyskaj ofertę SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
  
      // Prześlij ofertę SDP do drugiej osoby
      sendSignal('offer', offer);
  
      // Nasłuchuj sygnał odpowiedzi SDP od drugiej osoby
      rdb.ref(`rooms/${roomId}/answer`).on('value', (snapshot: any) => {
        const answer = snapshot.val();
        if (answer) {
          pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });
  
      // Nasłuchuj sygnał kandydatów ICE od drugiej osoby
      rdb.ref(`rooms/${roomId}/iceCandidate`).on('child_added', (snapshot: any) => {
        const iceCandidate = snapshot.val();
        if (iceCandidate) {
          pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
        }
      });
    } catch (error) {
      console.error("Błąd dołączania do pokoju:", error);
    }
  }
  
  // Funkcja do przesyłania kandydata ICE do drugiej osoby w pokoju
  function sendIceCandidate(candidate: any) {
    rdb.ref(`signal/iceCandidate`).push(candidate);
  }
  
  // Generowanie unikalnego identyfikatora pokoju
  function generateRoomId() {
    return Math.random().toString(36).substring(2, 8);
  }
  
  // Utworzenie nowego pokoju
  function createRoom() {
    const roomId = generateRoomId();
    console.log('Tworzenie pokoju:', roomId);
    joinRoom(roomId);
  }
  
  // Dołączanie do istniejącego pokoju
  function joinExistingRoom() {
    const roomId = prompt('Podaj identyfikator pokoju:');
    if (roomId) {
      console.log('Dołączanie do pokoju:', roomId);
      joinRoom(roomId);
    } else {
      console.error("Nie podano identyfikatora pokoju.");
    }
  }
  
  // Przyciski do tworzenia i dołączania do pokoju
  const callButton: HTMLButtonElement = document.querySelector("#callButton");
  callButton.addEventListener("click", createRoom);
  
  const joinRoomButton: HTMLButtonElement = document.querySelector("#joinRoomButton");
  joinRoomButton.addEventListener("click", joinExistingRoom);