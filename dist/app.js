function toSite(site) {
    window.location.search = site;
}
const route = window.location.search.substring(1);
if (route != "") {
    fetch(`./src/routes/${route}.html`)
        .then(function (response) {
        if (!response.ok) {
            window.location.search = "";
        }
        return response.text();
    })
        .then(function (html) {
        document.body.innerHTML = html;
    });
}
const addFriendButton = document.querySelector('#addFriend');
addFriendButton.addEventListener('click', () => {
    const addFriendDiv = document.querySelector('#addFriendDiv');
    addFriendDiv.classList.toggle('show');
});
const addFriendSubmit = document.querySelector('#addFriendSubmit');
addFriendSubmit.addEventListener('click', () => addFriend());
async function addFriend() {
    const addFriendInput = document.querySelector('#addFriendInput');
    const friendsList = document.querySelector('.friends-list');
    if (addFriendInput.value == auth.currentUser.email) {
        addFriendInput.value = '';
        return;
    }
    await rdb.ref(`users/`).once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const childData = childSnapshot.val();
            if (childData.email == addFriendInput.value) {
                const friend = document.createElement('div');
                const friendID = friendsList.childElementCount - 1;
                let friendDescription = "Let's start chat!";
                friend.classList.add('friend');
                friend.id = friendID;
                friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span>${friendDescription}</span></div>`;
                friendsList.appendChild(friend);
                addFriendToDatabase(childData.nickname);
                friend.addEventListener('click', () => selectFriend(friendID, childData.nickname));
                addFriendInput.value = '';
                return;
            }
        });
    });
}
function addFriendToDatabase(nickname) {
    const uid = auth.currentUser.uid;
    const data = {
        friend: nickname
    };
    rdb.ref(`users/${uid}/friends/friend_${nickname}`).set(data);
}
async function loadFriendsFromDatabase() {
    if (!auth.currentUser)
        return;
    const uid = auth.currentUser.uid;
    const friendsList = document.querySelector('.friends-list');
    await rdb.ref(`users/${uid}/friends`).once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const childData = childSnapshot.val();
            const friend = document.createElement('div');
            const friendID = friendsList.childElementCount - 1;
            let friendDescription = "Let's start chat!";
            friend.classList.add('friend');
            friend.id = friendID;
            friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`;
            friendsList.appendChild(friend);
            friend.addEventListener('click', () => selectFriend(friendID, childData.friend));
        });
    });
}
window.setTimeout(() => {
    loadFriendsFromDatabase();
}, 1000);
async function selectFriend(id, friendName) {
    const friendsList = document.querySelector('.friends-list');
    await resetActives();
    friendsList.children[id + 1].classList.add('active');
    await changeChatSelect(friendName);
    addListenerToMessage();
}
function resetActives() {
    const friendsList = document.querySelector('.friends-list');
    for (let i = 0; i < friendsList.childElementCount - 1; i++) {
        friendsList.children[i + 1].classList.remove('active');
    }
}
async function changeChatSelect(friendName) {
    threadUserElement.textContent = friendName;
    await loadMessages();
}
let isWindowActive = true;
window.addEventListener("beforeunload", () => {
    const uid = auth.currentUser.uid;
    firebase.database().ref(`users/${uid}/isWindowActive`).set(false);
});
function checkWindowStatus() {
    if (!document.hidden) {
        isWindowActive = true;
    }
    else {
        isWindowActive = false;
    }
    const uid = auth.currentUser.uid;
    firebase.database().ref(`users/${uid}/isWindowActive`).set(isWindowActive);
    const activeStatus = document.querySelector('#activeStatus');
    rdb.ref(`users/${threadUser}/`).once('value', function (snapshot) {
        const userIsActive = snapshot.val().isWindowActive;
        if (userIsActive) {
            activeStatus.innerHTML = '<div class="status"></div> Online';
            return;
        }
        activeStatus.innerHTML = '<div class="status offline"></div> Offline';
    });
}
window.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("visibilitychange", checkWindowStatus);
    setInterval(checkWindowStatus, 3000);
});
const friends = document.querySelector('.friends');
const chat = document.querySelector('.chat');
const toChatsButton = document.querySelector('.toChats');
let activeFriends = document.querySelectorAll('.friend.active');
toChatsButton.children[0].addEventListener('click', () => {
    activeFriends.forEach(element => {
        element.classList.remove('active');
    });
});
window.setInterval(() => {
    activeFriends = document.querySelectorAll('.friend.active');
    if (activeFriends.length > 0) {
        friends.classList.add('hide');
        chat.classList.add('show');
    }
    else {
        friends.classList.remove('hide');
        chat.classList.remove('show');
    }
}, 300);
const endCallButton = document.querySelector('.call-option-end');
const callScreen = document.querySelector(".call-screen");
async function startCall() {
    try {
        callScreen.classList.add('show');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const localVideo = document.querySelector("#localVideo");
        localVideo.srcObject = stream;
        console.log(stream);
        const pc = new RTCPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendIceCandidate(event.candidate);
            }
        };
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal('offer', offer);
        rdb.ref('signal/answer').on('value', (snapshot) => {
            const answer = snapshot.val();
            if (answer) {
                pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });
        rdb.ref('signal/iceCandidate').on('child_added', (snapshot) => {
            const iceCandidate = snapshot.val();
            if (iceCandidate) {
                pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
            }
        });
    }
    catch (error) {
        console.error("Błąd rozpoczynania rozmowy:", error);
    }
}
function sendSignal(signalType, signalData) {
    rdb.ref(`signal/${signalType}`).set(signalData);
}
async function joinRoom(roomId) {
    try {
        callScreen.classList.add('show');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const localVideo = document.querySelector("#localVideo");
        localVideo.srcObject = stream;
        console.log(stream);
        const pc = new RTCPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendIceCandidate(event.candidate);
            }
        };
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal('offer', offer);
        rdb.ref(`rooms/${roomId}/answer`).on('value', (snapshot) => {
            const answer = snapshot.val();
            if (answer) {
                pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });
        rdb.ref(`rooms/${roomId}/iceCandidate`).on('child_added', (snapshot) => {
            const iceCandidate = snapshot.val();
            if (iceCandidate) {
                pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
            }
        });
    }
    catch (error) {
        console.error("Błąd dołączania do pokoju:", error);
    }
}
function sendIceCandidate(candidate) {
    rdb.ref(`signal/iceCandidate`).push(candidate);
}
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8);
}
function createRoom() {
    const roomId = generateRoomId();
    console.log('Tworzenie pokoju:', roomId);
    joinRoom(roomId);
}
function joinExistingRoom() {
    const roomId = prompt('Podaj identyfikator pokoju:');
    if (roomId) {
        console.log('Dołączanie do pokoju:', roomId);
        joinRoom(roomId);
    }
    else {
        console.error("Nie podano identyfikatora pokoju.");
    }
}
const callButton = document.querySelector("#callButton");
callButton.addEventListener("click", createRoom);
const joinRoomButton = document.querySelector("#joinRoomButton");
joinRoomButton.addEventListener("click", joinExistingRoom);
const callOption = document.querySelectorAll('.call-option');
callOption.forEach(option => {
    option.addEventListener('click', () => {
        option.classList.toggle('disable');
    });
});
const muteOption = document.querySelector('.call-option-mute');
const videoOption = document.querySelector('.call-option-video');
muteOption.addEventListener('click', () => {
    if (muteOption.innerHTML == '<i class="fas fa-microphone"></i>') {
        muteOption.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    }
    else {
        muteOption.innerHTML = '<i class="fas fa-microphone"></i>';
    }
});
videoOption.addEventListener('click', () => {
    if (videoOption.innerHTML == '<i class="fas fa-video"></i>') {
        videoOption.innerHTML = '<i class="fas fa-video-slash"></i>';
    }
    else {
        videoOption.innerHTML = '<i class="fas fa-video"></i>';
    }
});
let msgID = 0;
async function getMessageID(threadID) {
    await rdb.ref(`messages/${threadID.sort()}`).once("value", function (snapshot) {
        msgID = snapshot.numChildren();
    });
}
let threadUser = '';
const threadUserElement = document.querySelector('#threadUser');
async function getThreadUser() {
    const threadUserNickname = threadUserElement.textContent;
    await rdb.ref(`users/`).once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const childData = childSnapshot.val();
            if (childData.nickname != threadUserNickname)
                return;
            threadUser = childData.uid;
        });
    });
}
let msgAuthor = '';
let userNickname = '';
window.setTimeout(() => {
    if (!auth.currentUser)
        return;
    const uid = auth.currentUser.uid;
    rdb.ref(`users/${uid}`).once('value', function (snapshot) {
        msgAuthor = snapshot.val().nickname;
        userNickname = snapshot.val().nickname;
    });
}, 1000);
let messageSpan = document.querySelectorAll('#message-content');
let friendActive = document.querySelector('.friend.active');
function loadLatestMessage() {
    messageSpan = document.querySelectorAll('#message-content');
    friendActive = document.querySelector('.friend.active');
    const messageSpanContent = messageSpan[messageSpan.length - 1].textContent;
    friendActive.children[1].children[1].textContent = messageSpanContent;
    friendActive.children[1].children[1].textContent = friendActive.children[1].children[1].textContent.substr(0, 18);
}
async function loadMessages() {
    clearChatMessages();
    await getThreadUser();
    if (threadUser == '') {
        return;
    }
    const uid = auth.currentUser.uid;
    const user = auth.currentUser.email;
    const messages = document.querySelector('.messages');
    await getThreadUser();
    const threadID = [uid, threadUser];
    await rdb.ref(`messages/${threadID.sort()}`).once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const childData = childSnapshot.val();
            const message = document.createElement('div');
            const created = childData.author;
            if (created == user) {
                message.classList.add('message', 'author');
            }
            else {
                message.classList.add('message');
            }
            if (!childData.url) {
                if (created == user) {
                    message.innerHTML = `<div><h2>${childData.nickname}</h2><span id="message-content">${childData.message}</span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                }
                else {
                    message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span id="message-content">${childData.message}</span></div>`;
                }
            }
            else {
                if (childData.url.includes('data:image')) {
                    if (created == user) {
                        message.innerHTML = `<div><h2>${childData.nickname}</h2><span><img src="${childData.url}"></img></span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                    }
                    else {
                        message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span><img src="${childData.url}"></img></span></div>`;
                    }
                }
                else {
                    if (created == user) {
                        message.innerHTML = `<div><h2>${childData.nickname}</h2><span><video controls src="${childData.url}"></video></span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                    }
                    else {
                        message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span><video controls src="${childData.url}"></video></span></div>`;
                    }
                }
            }
            messages.appendChild(message);
            loadLatestMessage();
        });
    });
    messages.scrollTop = messages.scrollHeight;
}
function clearChatMessages() {
    const messages = document.querySelector('.messages');
    messages.innerHTML = ``;
}
const imageInput = document.querySelector("#file-upload");
imageInput.addEventListener("change", (e) => {
    const file = imageInput.files[0];
    const reader = new FileReader;
    reader.addEventListener("load", async () => {
        const uid = auth.currentUser.uid;
        const user = auth.currentUser.email;
        const data = {
            author: user,
            nickname: userNickname,
            message: '',
            url: reader.result,
        };
        getThreadUser();
        const threadID = [uid, threadUser];
        if (threadUser == '') {
            return;
        }
        await getMessageID(threadID);
        const messageIdWithLeadingZeros = `message_${msgID.toString().padStart(8, '0')}`;
        firebase.database().ref(`messages/${threadID.sort()}/${messageIdWithLeadingZeros}/`).set(data);
        loadMessages();
    });
    reader.readAsDataURL(file);
});
const sended_message = document.querySelector('#sended_message');
async function sendMessageAsButton() {
    const input = sended_message.children[0];
    await getThreadUser();
    if (threadUser == '') {
        return;
    }
    await sendMessageToDatabase(input.value);
    input.value = '';
}
sended_message.addEventListener('submit', async (e) => {
    e.preventDefault();
    sendMessageAsButton();
});
let chatRef = null;
async function addListenerToMessage() {
    const uid = auth.currentUser.uid;
    if (chatRef) {
        chatRef.off();
    }
    await getThreadUser();
    if (threadUser === '') {
        return;
    }
    const threadID = [uid, threadUser].sort().join(',');
    const chat = rdb.ref(`messages/${threadID}`);
    chatRef = chat;
    let initialLoad = true;
    chat.limitToLast(1).on('child_added', (data) => {
        if (initialLoad) {
            initialLoad = false;
            return;
        }
        const created = data.val().author;
        const user = auth.currentUser.email;
        if (created !== user) {
            sendMessage(data.val());
        }
    });
}
async function sendMessage(childData) {
    await getThreadUser();
    if (threadUser == '') {
        return;
    }
    const message = document.createElement('div');
    const created = childData.author;
    const user = auth.currentUser.email;
    if (created == user) {
        message.classList.add('message', 'author');
    }
    else {
        message.classList.add('message');
    }
    if (!childData.url) {
        if (created == user) {
            message.innerHTML = `<div><h2>${childData.nickname}</h2><span id="message-content">${childData.message}</span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
        }
        else {
            message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span id="message-content">${childData.message}</span></div>`;
        }
    }
    else {
        if (childData.url.includes('data:image')) {
            if (created == user) {
                message.innerHTML = `<div><h2>${childData.nickname}</h2><span><img src="${childData.url}"></img></span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
            }
            else {
                message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span><img src="${childData.url}"></img></span></div>`;
            }
        }
        else {
            if (created == user) {
                message.innerHTML = `<div><h2>${childData.nickname}</h2><span><video src="${childData.url}"></video></span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
            }
            else {
                message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span><video src="${childData.url}"></video></span></div>`;
            }
        }
    }
    const messages = document.querySelector('.messages');
    await messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    loadLatestMessage();
}
async function sendMessageToDatabase(msg) {
    const uid = auth.currentUser.uid;
    const user = auth.currentUser.email;
    const data = {
        message: msg,
        author: user,
        nickname: userNickname,
    };
    await getThreadUser();
    const threadID = [uid, threadUser];
    await getMessageID(threadID);
    const messageIdWithLeadingZeros = `message_${msgID.toString().padStart(8, '0')}`;
    await rdb.ref(`messages/${threadID.sort()}/${messageIdWithLeadingZeros}`).set(data);
    if (messageIdWithLeadingZeros == 'message_00000000') {
        let myNickname = '';
        await rdb.ref(`users/${uid}`).once("value", function (snapshot) {
            myNickname = snapshot.val().nickname;
        });
        rdb.ref(`users/${threadUser}/friends/friend_${myNickname}`).once("value", function (snapshot) {
            if (!snapshot.exists()) {
                const data = {
                    friend: myNickname
                };
                rdb.ref(`users/${threadUser}/friends/friend_${myNickname}`).set(data);
            }
        });
    }
    sendMessage(data);
}
const auth = firebase.auth();
const rdb = firebase.database();
function loginCheck() {
    const log_email = document.querySelector("#log_email");
    const log_password = document.querySelector("#log_password");
    if (log_email.value == "" || !log_email.value.includes("@")) {
        log_email.classList.add("error");
        return;
    }
    else {
        log_email.classList.remove("error");
    }
    if (log_password.value == "" || log_password.value.length < 8) {
        log_password.classList.add("error");
        return;
    }
    else {
        log_password.classList.remove("error");
    }
    login(log_email.value, log_password.value);
}
window.setTimeout(() => {
    if (auth.currentAuth)
        return;
    const log_form = document.querySelector("#log_form");
    log_form.addEventListener("submit", (event) => {
        event.preventDefault();
        loginCheck();
    });
    const show_pass = document.querySelector("#show_pass");
    const log_password = document.querySelector("#log_password");
    show_pass.addEventListener("click", () => {
        if (log_password.type == "password") {
            log_password.type = "text";
            show_pass.classList.replace("fa-eye", "fa-eye-slash");
        }
        else {
            log_password.type = "password";
            show_pass.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
}, 2000);
function login(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(function () {
        window.location.reload();
    })
        .catch(function (error) {
        let error_message = error.message;
        console.error(error_message);
    });
}
let currentAuth = 'register';
setTimeout(() => {
    checkAuth();
}, 1000);
function userManage(auth) {
    currentAuth = auth;
    checkAuth();
}
function checkAuth() {
    if (!auth.currentUser) {
        const userManage = document.querySelector('.user-manage');
        userManage.classList.add('show');
        if (currentAuth == 'register') {
            const container_reg = document.querySelector('#container_reg');
            const container_log = document.querySelector('#container_log');
            container_reg.classList.remove('hide');
            container_log.classList.add('hide');
        }
        else {
            const container_reg = document.querySelector('#container_reg');
            const container_log = document.querySelector('#container_log');
            container_reg.classList.add('hide');
            container_log.classList.remove('hide');
        }
    }
}
function registerCheck() {
    const reg_nickname = document.querySelector("#reg_nickname");
    const reg_email = document.querySelector("#reg_email");
    const reg_password = document.querySelector("#reg_password");
    if (reg_nickname.value == "") {
        reg_nickname.classList.add("error");
        return;
    }
    else {
        reg_nickname.classList.remove("error");
    }
    if (reg_email.value == "" || !reg_email.value.includes("@")) {
        reg_email.classList.add("error");
        return;
    }
    else {
        reg_email.classList.remove("error");
    }
    if (reg_password.value == "" || reg_password.value.length < 8) {
        reg_password.classList.add("error");
        return;
    }
    else {
        reg_password.classList.remove("error");
    }
    register(reg_email.value, reg_password.value, reg_nickname.value);
}
window.setTimeout(() => {
    if (auth.currentAuth)
        return;
    const reg_form = document.querySelector("#reg_form");
    reg_form.addEventListener("submit", (event) => {
        event.preventDefault();
        registerCheck();
    });
    const show_pass = document.querySelector("#show_pass");
    const reg_password = document.querySelector("#reg_password");
    show_pass.addEventListener("click", () => {
        if (reg_password.type == "password") {
            reg_password.type = "text";
            show_pass.classList.replace("fa-eye", "fa-eye-slash");
        }
        else {
            reg_password.type = "password";
            show_pass.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
}, 2000);
function register(email, password, nickname) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(async function () {
        let database_ref = rdb.ref();
        const uid = auth.currentUser.uid;
        const data = {
            email: email,
            password: password,
            nickname: nickname,
            uid: uid
        };
        await database_ref.child(`users/${uid}`).set(data);
        window.location.reload();
    })
        .catch(function (error) {
        let error_message = error.message;
        console.error(error_message);
    });
}
//# sourceMappingURL=app.js.map