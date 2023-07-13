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
function changeChatSelect(friendName) {
    threadUserElement.textContent = friendName;
    loadMessages();
}
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
                    message.innerHTML = `<div><h2>${childData.nickname}</h2><span>${childData.message}</span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                }
                else {
                    message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span>${childData.message}</span></div>`;
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
let initialLoad = true;
function addListenerToMessage() {
    const uid = auth.currentUser.uid;
    getThreadUser().then(async () => {
        const threadID = [uid, threadUser];
        const chat = rdb.ref(`messages/${threadID.sort()}`);
        chat.orderByKey().limitToLast(1).on('child_added', (data) => {
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
            message.innerHTML = `<div><h2>${childData.nickname}</h2><span>${childData.message}</span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
        }
        else {
            message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span>${childData.message}</span></div>`;
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