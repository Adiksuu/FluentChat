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
const emojiAPI = 'baf1112db07c91085f26890bbab13a83ac591cc4';
fetch('https://emoji-api.com/emojis?access_key=34f6266993937b3fe71703a6080917b93b76f944')
    .then(res => res.json())
    .then(data => loadEmojis(data));
const emojiList = document.querySelector('.emoji-list');
const emojiFace = document.querySelector('.emoji-face');
const emojiAnimals = document.querySelector('.emoji-animals');
const emojiFood = document.querySelector('.emoji-food');
const emojiTransport = document.querySelector('.emoji-transport');
const emojiExtra = document.querySelector('.emoji-extra');
const emojiIcons = document.querySelector('.emoji-icons');
const emojiFlags = document.querySelector('.emoji-flags');
const addedEmojis = [];
function loadEmojis(data) {
    data.forEach((emoji) => {
        if (!addedEmojis.includes(emoji.character)) {
            let button = document.createElement('button');
            button.textContent = emoji.character;
            button.addEventListener('click', () => addEmoji(emoji.character));
            if (emoji.group === "smileys-emotion" || emoji.group === "people-body") {
                emojiFace.appendChild(button);
            }
            else if (emoji.group === "animals-nature") {
                emojiAnimals.appendChild(button);
            }
            else if (emoji.group === "food-drink") {
                emojiFood.appendChild(button);
            }
            else if (emoji.group === "travel-places") {
                emojiTransport.appendChild(button);
            }
            else if (emoji.group === "objects" || emoji.group === "activities") {
                emojiExtra.appendChild(button);
            }
            else if (emoji.group === "symbols") {
                emojiIcons.appendChild(button);
            }
            else if (emoji.group === "flags") {
                emojiFlags.appendChild(button);
            }
            addedEmojis.push(emoji.character);
        }
    });
}
function addEmoji(emoji) {
    const input = document.querySelector('#sendMessageInput');
    input.value += emoji;
}
const showEmoji = document.querySelector('#showEmoji');
showEmoji.addEventListener('click', () => {
    const emojisPopup = document.querySelector('.emojis-popup');
    emojisPopup.classList.toggle('show');
});
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
                const friendUID = childData.uid;
                let friendDescription = "Let's start chat!";
                friend.classList.add('friend');
                friend.id = friendID;
                rdb.ref(`users/${childData.uid}`).once('value', function (snapshot) {
                    if (snapshot.val().url) {
                        friend.innerHTML = `<img src="${snapshot.val().url}" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`;
                    }
                    else {
                        friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`;
                    }
                });
                friendsList.appendChild(friend);
                addFriendToDatabase(childData.nickname, friendUID);
                friend.addEventListener('click', () => selectFriend(friendID, childData.nickname));
                addFriendInput.value = '';
                return;
            }
        });
    });
}
function addFriendToDatabase(nickname, friendUID) {
    const uid = auth.currentUser.uid;
    const data = {
        friend: nickname,
        uid: friendUID
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
            rdb.ref(`users/${childData.uid}`).once('value', function (snapshot) {
                if (snapshot.val().url) {
                    friend.innerHTML = `<img src="${snapshot.val().url}" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`;
                }
                else {
                    friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`;
                }
            });
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
    navUserAvatar.src = friendsList.children[id + 1].children[0].src;
    await changeChatSelect(friendName);
    await addListenerToMessage();
    loadGroupName();
}
function resetActives() {
    const friendsList = document.querySelector('.friends-list');
    for (let i = 0; i < friendsList.childElementCount - 1; i++) {
        friendsList.children[i + 1].classList.remove('active');
    }
}
const navUserAvatar = document.querySelector('#navUserAvatar');
async function changeChatSelect(friendName) {
    threadUserElement.textContent = friendName;
    await loadMessages();
}
let isWindowActive = true;
window.addEventListener("beforeunload", () => {
    if (!auth.currentUser)
        return;
    if (threadUser.includes('Group_'))
        return;
    const uid = auth.currentUser.uid;
    firebase.database().ref(`users/${uid}/isWindowActive`).set(false);
});
function checkWindowStatus() {
    if (!auth.currentUser)
        return;
    if (threadUser.includes('Group_')) {
        const activeStatus = document.querySelector('#activeStatus');
        rdb.ref(`groups/${threadUser.replace('Group_', '')}/users/`).once('value', function (snapshot) {
            if (!snapshot.exists())
                return;
            activeStatus.innerHTML = `<div class="status"></div> Group | ${snapshot.numChildren()} members <button onclick="toggleAddUsers()"><i class="fas fa-plus"></i></button><button onclick="editGroupName()"><i class="fas fa-pencil"></i></button>`;
        });
        return;
    }
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
function toggleAddUsers() {
    const addUserDiv = document.querySelector('#addUserDiv');
    const changeGroupDiv = document.querySelector('#changeGroupDiv');
    addUserDiv.classList.toggle('show');
    changeGroupDiv.classList.remove('show');
}
function addUserToGroup(groupID, userUID) {
    const data = {
        groupID: groupID,
        groupName: `Group_${groupID}`,
    };
    const userData = {
        userUID: userUID
    };
    rdb.ref(`users/${userUID}/groups/${groupID}`).set(data);
    rdb.ref(`groups/${groupID}/users/${userUID}`).set(userData);
}
const addUserInput = document.querySelector('#addUserInput');
const addUserSubmit = document.querySelector('#addUserSubmit');
addUserSubmit.addEventListener('click', async () => {
    if (addUserInput.value == auth.currentUser.email) {
        addUserInput.value = '';
        return;
    }
    await rdb.ref(`users/`).once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const childData = childSnapshot.val();
            if (childData.email == addUserInput.value) {
                addUserToGroup(threadUser.replace('Group_', ''), childData.uid);
                addUserInput.value = '';
                return;
            }
        });
    });
});
function editGroupName() {
    const changeGroupDiv = document.querySelector('#changeGroupDiv');
    const addUserDiv = document.querySelector('#addUserDiv');
    changeGroupDiv.classList.toggle('show');
    addUserDiv.classList.remove('show');
}
const groupNameInput = document.querySelector('#groupNameInput');
const groupNameSubmit = document.querySelector('#groupNameSubmit');
groupNameSubmit.addEventListener('click', () => submitGroupName());
async function submitGroupName() {
    const data = {
        customGroupName: groupNameInput.value
    };
    await rdb.ref(`groups/${threadUser.replace('Group_', '')}`).update(data);
    window.location.reload();
}
function loadGroupName() {
    if (threadUser.includes('Group_')) {
        rdb.ref(`groups/${threadUser.replace('Group_', '')}`).once('value', function (snapshot) {
            threadUserElement.textContent = snapshot.val().customGroupName;
        });
    }
}
async function createGroup() {
    const groupID = Math.floor(Math.random() * 9999999);
    const data = {
        id: groupID,
        ownerUID: auth.currentUser.uid,
        groupName: `Group_${groupID}`,
        customGroupName: `Group_${groupID}`
    };
    rdb.ref(`groups/${groupID}`).set(data);
    await addUserToGroup(groupID.toString(), auth.currentUser.uid);
    loadGroupsFromDatabase();
}
const createGroupButton = document.querySelector('#createGroup');
createGroupButton.addEventListener('click', () => createGroup());
async function loadGroupsFromDatabase() {
    if (!auth.currentUser)
        return;
    const uid = auth.currentUser.uid;
    const friendsList = document.querySelector('.friends-list');
    await rdb.ref(`users/${uid}/groups/`).once("value", function (snapshot) {
        snapshot.forEach(async function (childSnapshot) {
            const childData = childSnapshot.val();
            const friend = document.createElement('div');
            const friendID = friendsList.childElementCount - 1;
            let friendDescription = "Let's start chat!";
            friend.classList.add('friend');
            friend.id = friendID;
            await rdb.ref(`groups/${childData.groupID}`).once('value', function (snapshot) {
                friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${snapshot.val().customGroupName}</h2><span>${friendDescription}</span></div>`;
            });
            friendsList.appendChild(friend);
            friend.addEventListener('click', () => selectFriend(friendID, childData.groupName));
        });
    });
}
window.setTimeout(() => {
    loadGroupsFromDatabase();
}, 1000);
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
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});
function loadDelMenus() {
    const buttons = document.querySelectorAll('button[id*="message_"]');
    buttons.forEach((button) => {
        button.addEventListener('click', () => deleteMessage(button.id));
    });
}
async function deleteMessage(ID) {
    await getThreadUser();
    let threadID;
    const uid = auth.currentUser.uid;
    if (!threadUser.includes('Group_')) {
        threadID = [uid, threadUser];
        rdb.ref(`messages/${threadID.sort().join(',')}/${ID}`).remove();
    }
    else {
        threadID = threadUser;
        rdb.ref(`messages/${threadID}/${ID}`).remove();
    }
    await rdb.ref(`messages/${threadID}/${ID}`).remove();
    window.location.reload();
}
let currentDate;
function getDate() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let formattedDay = day < 10 ? `0${day}` : day;
    let formattedMonth = month < 10 ? `0${month}` : month;
    let formattedHour = hour < 10 ? `0${hour}` : hour;
    let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    currentDate = `${formattedDay}.${formattedMonth}.${year} ${formattedHour}:${formattedMinutes}`;
}
let msgID = 0;
async function getMessageID(threadID) {
    let snapshot;
    if (!threadUser.includes('Group_')) {
        snapshot = await rdb.ref(`messages/${threadID.sort()}`).once("value");
    }
    else {
        snapshot = await rdb.ref(`messages/${threadID}`).once("value");
    }
    if (snapshot.val() == null) {
        msgID = 0;
        return;
    }
    const messageIDs = Object.keys(snapshot.val());
    const availableMessageIDs = [];
    for (const messageID of messageIDs) {
        const numberPart = messageID.split("_")[1];
        availableMessageIDs.push(parseInt(numberPart));
    }
    const maxMessageID = Math.max(...availableMessageIDs);
    msgID = maxMessageID + 1;
}
let threadUser = '';
const threadUserElement = document.querySelector('#threadUser');
async function getThreadUser() {
    const threadUserNickname = threadUserElement.textContent;
    if (!threadUserNickname.includes('Group_')) {
        await rdb.ref(`users/`).once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                const childData = childSnapshot.val();
                if (childData.nickname != threadUserNickname)
                    return;
                threadUser = childData.uid;
            });
        });
    }
    else {
        await rdb.ref(`groups/`).once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                const childData = childSnapshot.val();
                if (childData.groupName != threadUserNickname)
                    return;
                const id = threadUserNickname;
                threadUser = id;
            });
        });
    }
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
    friendActive.children[1].children[1].textContent = `${friendActive.children[1].children[1].textContent.substr(0, 21)}...`;
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
    const firstMessage = document.createElement('div');
    firstMessage.classList.add('first-message');
    firstMessage.innerHTML = `<span>This is the beginning of a beautiful conversation</span>`;
    messages.appendChild(firstMessage);
    getMyAvatar();
    await getThreadUser();
    getThreadAvatar();
    let threadID;
    if (!threadUser.includes('Group_')) {
        threadID = [uid, threadUser];
    }
    else {
        threadID = [threadUser];
    }
    await rdb.ref(`messages/${threadID.sort()}`).once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const childData = childSnapshot.val();
            const childKey = childSnapshot.key;
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
                    message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content">${childData.message}</span></div></div><img src="${myAvatar}" alt="">`;
                }
                else {
                    message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span id="message-content">${childData.message}</span></div>`;
                }
            }
            else {
                if (childData.url.includes('data:image')) {
                    if (created == user) {
                        message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span><img src="${childData.url}"></img></span></div></div><img src="${myAvatar}" alt="">`;
                    }
                    else {
                        message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span><img src="${childData.url}"></img></span></div>`;
                    }
                }
                else {
                    if (created == user) {
                        message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span><video controls src="${childData.url}"></video></span></div></div><img src="${myAvatar}" alt="">`;
                    }
                    else {
                        message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span><video controls src="${childData.url}"></video></span></div>`;
                    }
                }
            }
            messages.appendChild(message);
            loadLatestMessage();
        });
    });
    messages.scrollTop = messages.scrollHeight;
    loadDelMenus();
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
        await getDate();
        const data = {
            author: user,
            nickname: userNickname,
            message: '',
            url: reader.result,
            date: currentDate,
            uid: uid
        };
        getThreadUser();
        let threadID;
        if (!threadUser.includes('Group_')) {
            threadID = [uid, threadUser];
        }
        else {
            threadID = threadUser;
        }
        if (threadUser == '') {
            return;
        }
        await getMessageID(threadID);
        const messageIdWithLeadingZeros = `message_${msgID.toString().padStart(8, '0')}`;
        if (!threadUser.includes('Group_')) {
            await firebase.database().ref(`messages/${threadID.sort()}/${messageIdWithLeadingZeros}/`).set(data);
        }
        else {
            await firebase.database().ref(`messages/${threadID}/${messageIdWithLeadingZeros}/`).set(data);
        }
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
    let threadID;
    if (!threadUser.includes('Group_')) {
        threadID = [uid, threadUser].sort().join(',');
    }
    else {
        threadID = threadUser;
    }
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
        const childKey = data.key;
        if (created !== user) {
            sendMessage(data.val(), childKey);
        }
    });
}
async function sendMessage(childData, childKey) {
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
    getMyAvatar();
    await getThreadAvatar(childData);
    if (!childData.url) {
        if (created == user) {
            message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content">${childData.message}</span></div></div><img src="${myAvatar}" alt="">`;
        }
        else {
            message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span id="message-content">${childData.message}</span></div>`;
        }
    }
    else {
        if (childData.url.includes('data:image')) {
            if (created == user) {
                message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span><img src="${childData.url}"></img></span></div></div><img src="${myAvatar}" alt="">`;
            }
            else {
                message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span><img src="${childData.url}"></img></span></div>`;
            }
        }
        else {
            if (created == user) {
                message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span><video controls src="${childData.url}"></video></span></div></div><img src="${myAvatar}" alt="">`;
            }
            else {
                message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span><video controls src="${childData.url}"></video></span></div>`;
            }
        }
    }
    const messages = document.querySelector('.messages');
    await messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    loadLatestMessage();
    loadDelMenus();
}
async function sendMessageToDatabase(msg) {
    const uid = auth.currentUser.uid;
    const user = auth.currentUser.email;
    await getDate();
    const data = {
        message: msg,
        author: user,
        nickname: userNickname,
        date: currentDate,
        uid: uid
    };
    await getThreadUser();
    let threadID;
    if (!threadUser.includes('Group_')) {
        threadID = [uid, threadUser];
    }
    else {
        threadID = threadUser;
    }
    await getMessageID(threadID);
    const messageIdWithLeadingZeros = `message_${msgID.toString().padStart(8, '0')}`;
    if (!threadUser.includes('Group_')) {
        await rdb.ref(`messages/${threadID.sort()}/${messageIdWithLeadingZeros}`).set(data);
    }
    else {
        await rdb.ref(`messages/${threadID}/${messageIdWithLeadingZeros}`).set(data);
        sendMessage(data, messageIdWithLeadingZeros);
        return;
    }
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
    sendMessage(data, messageIdWithLeadingZeros);
}
const auth = firebase.auth();
const rdb = firebase.database();
const imageChangeInput = document.querySelector("#image-upload");
imageChangeInput.addEventListener("change", () => {
    const file = imageChangeInput.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', async () => {
        const uid = auth.currentUser.uid;
        if (reader.result) {
            const data = {
                url: reader.result,
            };
            await rdb.ref(`users/${uid}/`).update(data);
            loadAvatar();
        }
        else
            return;
    });
    reader.readAsDataURL(file);
});
setTimeout(() => {
    loadAvatar();
}, 1500);
function loadAvatar() {
    if (!auth.currentUser)
        return;
    const imageToChange = document.querySelector('#imageToChange');
    const uid = auth.currentUser.uid;
    rdb.ref(`users/${uid}/`).once('value', function (snapshot) {
        if (!snapshot.exists() || !snapshot.val().url)
            return;
        imageToChange.src = snapshot.val().url;
    });
}
let myAvatar;
let threadAvatar;
async function getMyAvatar() {
    const uid = auth.currentUser.uid;
    const snapshot = await rdb.ref(`users/${uid}/`).once('value');
    if (!snapshot.exists() || !snapshot.val().url) {
        myAvatar = './src/assets/images/logo-bg.png';
        return;
    }
    myAvatar = snapshot.val().url;
}
async function getThreadAvatar() {
    if (!threadUser.includes('Group_')) {
        const snapshot = await rdb.ref(`users/${threadUser}/`).once('value');
        if (!snapshot.exists() || !snapshot.val().url) {
            threadAvatar = './src/assets/images/logo-bg.png';
        }
        threadAvatar = snapshot.val().url;
    }
    else {
        threadAvatar = './src/assets/images/logo-bg.png';
    }
}
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
const showAccountSettingsButton = document.querySelector('#showAccountSettings');
const accountSettings = document.querySelector('.account-settings');
showAccountSettingsButton.addEventListener('click', () => showAccountSettings());
function showAccountSettings() {
    accountSettings.classList.toggle('show');
}
accountSettings.addEventListener('click', () => logout());
async function logout() {
    await auth.signOut();
    window.location.reload();
}
let currentAuth = 'register';
setTimeout(() => {
    checkAuth();
}, 2000);
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