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
const showEmoji = document.querySelector('#showEmoji');
const emojisPopup = document.querySelector('.emojis-popup');
showEmoji.addEventListener('click', () => {
    emojisPopup.classList.toggle('show');
    if (inReactionMode) {
        inReactionMode = false;
    }
    else {
        inReactionMode = true;
    }
});
function addEmoji(emoji) {
    if (!inReactionMode) {
        const input = document.querySelector('#sendMessageInput');
        input.value += emoji;
    }
    else {
        addEmojiMessage(currentButtonID, currentButton, emoji);
        emojisPopup.classList.toggle('show');
    }
}
const addFriendButton = document.querySelector('#addFriend');
addFriendButton.addEventListener('click', () => {
    const addFriendDiv = document.querySelector('#addFriendDiv');
    addFriendDiv.classList.toggle('show');
});
const addFriendSubmit = document.querySelector('#addFriendSubmit');
addFriendSubmit.addEventListener('click', () => addFriend());
function addSupportFriend(supportUID) {
    const friendsList = document.querySelector('.friends-list');
    rdb.ref(`users/${supportUID}`).once("value", async function (snapshot) {
        await addFriendToDatabase(snapshot.val().nickname, supportUID);
        await friendsList.querySelectorAll('div.friend').forEach(element => {
            element.remove();
        });
        refreshFriends();
        return;
    });
}
async function addFriend() {
    const addFriendInput = document.querySelector('#addFriendInput');
    const friendsList = document.querySelector('.friends-list');
    if (addFriendInput.value == auth.currentUser.email) {
        addFriendInput.value = '';
        return;
    }
    const snapshot = await rdb.ref(`users/`).once("value");
    snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        if (childData.email == addFriendInput.value) {
            const friendUID = childData.uid;
            addFriendToDatabase(childData.nickname, friendUID);
            addFriendInput.value = '';
            friendsList.querySelectorAll('div.friend').forEach(element => {
                element.remove();
            });
            refreshFriends();
            return;
        }
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
    const snapshot = await rdb.ref(`users/${uid}/friends`).once("value");
    const friendsData = snapshot.val();
    for (const friendDataKey in friendsData) {
        if (friendsData.hasOwnProperty(friendDataKey)) {
            const childData = friendsData[friendDataKey];
            const friend = document.createElement('div');
            const friendID = friendsList.childElementCount - 1;
            let friendDescription = "Let's start chat!";
            friend.classList.add('friend');
            friend.id = friendID;
            const userDataSnapshot = await rdb.ref(`users/${childData.uid}`).once('value');
            const userData = userDataSnapshot.val();
            if (userData && userData.url) {
                friend.innerHTML = `<img src="${userData.url}" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`;
            }
            else {
                friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`;
            }
            friendsList.appendChild(friend);
            friend.addEventListener('click', () => selectFriend(friendID, childData.friend));
        }
    }
}
const reloadFriendsButton = document.querySelector('#reloadFriends');
document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        refreshFriends();
    }, 1000);
});
reloadFriendsButton.addEventListener('click', () => refreshFriends());
async function refreshFriends() {
    const friendsList = document.querySelector('.friends-list');
    await loadFriendsFromDatabase();
    await loadGroupsFromDatabase();
    setTimeout(() => {
        if (friendsList.childElementCount == 1) {
            reloadFriendsButton.style.display = 'block';
        }
        else {
            reloadFriendsButton.style.display = 'none';
        }
    }, 500);
}
const addSupport = document.querySelector('#addSupport');
const supportUID = 'iUfIgliunOa0lzlM4ttXcZPcdW73';
addSupport.addEventListener('click', () => addSupportFriend(supportUID));
let inProfileMode = false;
async function showProfile(uid) {
    const user_profile = document.querySelector(".user-profile");
    if (inProfileMode) {
        inProfileMode = false;
        inEditProfile = false;
        user_profile.classList.remove("show");
    }
    else {
        inProfileMode = true;
        const userDataBasic = await rdb.ref(`users/${uid}`).once("value");
        const userDataAdvanced = await rdb
            .ref(`users/${uid}/info`)
            .once("value");
        const profile_avatar = document.querySelector("#profile-avatar");
        const profile_email = document.querySelector("#profile-email");
        const profile_nickname = document.querySelector("#profile-nickname");
        const profile_bio = document.querySelector("#profile-bio");
        const profile_created = document.querySelector("#profile-created");
        if (userDataBasic.val().url) {
            profile_avatar.src = userDataBasic.val().url;
        }
        else {
            profile_avatar.src = "./src/assets/images/logo-bg.png";
        }
        profile_email.textContent = userDataBasic.val().email;
        profile_nickname.textContent = `@${userDataBasic.val().nickname}`;
        if (userDataAdvanced.exists() && userDataAdvanced.val().bio) {
            profile_bio.textContent = userDataAdvanced.val().bio;
            if (inEditProfile) {
                profile_bio.contentEditable = 'true';
                profile_bio.addEventListener('input', () => {
                    const content = profile_bio.textContent;
                    const data = {
                        bio: content
                    };
                    rdb.ref(`users/${uid}/info`).update(data);
                });
            }
        }
        else {
            profile_bio.textContent = "Welcome on my bio";
        }
        if (userDataAdvanced.exists() && userDataAdvanced.val().created) {
            profile_created.textContent = userDataAdvanced.val().created;
        }
        else {
            profile_created.textContent = "Long ago";
        }
        user_profile.classList.add("show");
    }
}
document.body.addEventListener("click", (e) => {
    const user_profile = document.querySelector(".user-profile");
    if (e.target.classList.contains("messages") ||
        e.target.classList.contains("message")) {
        if (inProfileMode && user_profile.classList.contains("show")) {
            showProfile("");
        }
    }
});
const change_theme = document.querySelector("#change-theme");
change_theme.addEventListener("click", () => {
    if (inEditProfile)
        return;
    showProfile("");
    const theme_selector = document.querySelector(".theme-selector");
    theme_selector.classList.toggle("show");
    const exitSelector = document.querySelector("#exitThemeSelector");
    exitSelector.addEventListener("click", () => {
        theme_selector.classList.remove("show");
    });
});
const themes_list = document.querySelector(".list");
for (let i = 0; i < themes_list.childElementCount; i++) {
    themes_list.children[i].addEventListener("click", async () => {
        const uid = auth.currentUser.uid;
        const data = {
            url: themes_list.children[i].children[0].src
        };
        await rdb.ref(`users/${uid}/friends/friend_${userThreadNickname}`).update(data);
        loadWallpaper();
    });
}
async function removeFriend(nickname) {
    const uid = await auth.currentUser.uid;
    const data = rdb.ref(`users/${uid}/friends/friend_${nickname}`);
    await data.remove();
    window.location.reload();
}
async function selectFriend(id, friendName) {
    const friendsList = document.querySelector(".friends-list");
    await resetActives();
    friendsList.children[id + 1].classList.add("active");
    navUserAvatar.src = friendsList.children[id + 1].children[0].src;
    loadWallpaper();
    await changeChatSelect(friendName);
    await addListenerToMessage();
    loadGroupName();
}
function resetActives() {
    const friendsList = document.querySelector(".friends-list");
    for (let i = 0; i < friendsList.childElementCount - 1; i++) {
        friendsList.children[i + 1].classList.remove("active");
    }
}
const navUserAvatar = document.querySelector("#navUserAvatar");
async function changeChatSelect(friendName) {
    threadUserElement.textContent = friendName;
    await loadUser();
    await loadMessages();
    const messages = document.querySelector('.messages');
    if (messages.childElementCount == 1 && friendName == 'Fluent Support') {
        const message = document.createElement('div');
        message.classList.add('message');
        await getThreadAvatar();
        await getDate();
        const supportMessage = `Hello @${userNickname}, here's a thread created with the support of the Fluent-chat app, write what's going on, you'll get a reply soon`;
        message.innerHTML = `<img id="profile-image" src="${threadAvatar}" alt=""><div><h2>Fluent Support ${currentDate}</h2><div id="message-options"><span id="message-content">${supportMessage}</span></div></div>`;
        messages.appendChild(message);
        const messageContent = message.querySelector('#message-content');
        checkMessageFunctions(messageContent);
        const profileImage = message.querySelector('#profile-image');
        if (profileImage) {
            profileImage.addEventListener('click', () => showProfile(threadUser));
        }
    }
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
            activeStatus.innerHTML = `<div class="status"></div> Online <button onclick="removeFriend('${snapshot.val().nickname}')"><i class="fas fa-user-minus"></i></button>`;
            return;
        }
        activeStatus.innerHTML = `<div class="status offline"></div> Offline <button onclick="removeFriend('${snapshot.val().nickname}')"><i class="fas fa-user-minus"></i></button>`;
    });
}
window.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("visibilitychange", checkWindowStatus);
    setInterval(checkWindowStatus, 1000);
});
function toggleAddUsers() {
    const addUserDiv = document.querySelector('#addUserDiv');
    const changeGroupDiv = document.querySelector('#changeGroupDiv');
    addUserDiv.classList.toggle('show');
    changeGroupDiv.classList.remove('show');
}
async function loadWallpaper() {
    const uid = auth.currentUser.uid;
    await getThreadUser();
    const data = await rdb.ref(`users/${uid}/friends/friend_${userThreadNickname}`).once('value');
    const messages = document.querySelector('.messages');
    if (!data.exists()) {
        messages.style.background = `#f3f3f3`;
        return;
    }
    if (data.val().url && data.val().url.includes('/src/assets/images/logo.png')) {
        messages.style.background = `#f3f3f3`;
        return;
    }
    if (data.val().url) {
        messages.style.background = `url(${data.val().url}) no-repeat`;
        messages.style.backgroundPosition = 'center';
        messages.style.backgroundSize = 'cover';
    }
    else {
        messages.style.background = `#f3f3f3`;
    }
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
    window.location.reload();
}
let inReactionMode = false;
let currentButtonID;
let currentButton;
function loadEmojiMenus() {
    const buttons = document.querySelectorAll('button[id*="emoji_"]');
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            currentButtonID = button.id;
            currentButton = button;
            if (currentButton.parentElement.children[0].innerHTML.includes('<a>')) {
                deleteEmoji(currentButtonID.replace('emoji_', 'message_'), currentButton.parentElement.children[0]);
                return;
            }
            if (inReactionMode) {
                inReactionMode = false;
                emojisPopup.classList.remove('show');
            }
            else {
                inReactionMode = true;
                emojisPopup.classList.add('show');
            }
        });
    });
}
async function addEmojiMessage(ID, button, emoji) {
    await getThreadUser();
    let threadID;
    const uid = auth.currentUser.uid;
    if (!threadUser.includes("Group_")) {
        threadID = [uid, threadUser].sort().join(",");
    }
    else {
        threadID = threadUser;
    }
    const emojiRef = `messages/${threadID}/${ID.replace("emoji_", "message_")}/emojis/added`;
    const ref = await rdb.ref(emojiRef);
    ref.once("value", async function (snapshot) {
        const data = {
            user: uid,
            emoji: emoji
        };
        if (snapshot.exists()) {
            ref.remove();
        }
        else {
            ref.set(data);
        }
        loadEmojisFromDatabase(ID.replace('emoji_', 'message_'), button.parentElement.children[0]);
    });
}
function deleteEmoji(message_ID, message) {
    let threadID;
    const uid = auth.currentUser.uid;
    if (!threadUser.includes("Group_")) {
        threadID = [uid, threadUser].sort().join(",");
        const emojiRef = rdb.ref(`messages/${threadID}/${message_ID}/emojis/added`);
        const aTag = message.querySelector('a');
        if (aTag) {
            aTag.remove();
        }
        emojiRef.once("value", function (snapshot) {
            if (snapshot.exists())
                emojiRef.remove();
        });
    }
}
function loadEmojisFromDatabase(message_ID, message) {
    let threadID;
    const uid = auth.currentUser.uid;
    if (!threadUser.includes("Group_")) {
        threadID = [uid, threadUser].sort().join(",");
        rdb.ref(`messages/${threadID}/${message_ID}/emojis/`).once("value", function (snapshot) {
            if (!snapshot.exists()) {
                deleteEmoji(message_ID, message);
                return;
            }
            snapshot.forEach(function (childSnapshot) {
                const emoji = document.createElement("a");
                emoji.innerHTML = childSnapshot.val().emoji;
                message.appendChild(emoji);
            });
        });
    }
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
    }
    else {
        const messageIDs = Object.keys(snapshot.val());
        const availableMessageIDs = [];
        for (const messageID of messageIDs) {
            const numberPart = messageID.split("_")[1];
            if (!isNaN(parseInt(numberPart))) {
                availableMessageIDs.push(parseInt(numberPart));
            }
        }
        const maxMessageID = Math.max(...availableMessageIDs);
        msgID = maxMessageID + 1;
    }
}
let threadUser = '';
let userThreadNickname = '';
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
                userThreadNickname = childData.nickname;
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
                userThreadNickname = '';
            });
        });
    }
}
let userNickname = '';
function loadUser() {
    const uid = auth.currentUser.uid;
    rdb.ref(`users/${uid}`).once('value', function (snapshot) {
        userNickname = snapshot.val().nickname;
    });
}
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
    await getThreadAvatar();
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
            if (childKey == 'url')
                return;
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
                    message.innerHTML = `<img id="profile-image" src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content">${childData.message}</span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
                }
            }
            else {
                if (childData.url.includes('data:image')) {
                    if (created == user) {
                        message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content"><img src="${childData.url}"></img></span></div></div><img src="${myAvatar}" alt="">`;
                    }
                    else {
                        message.innerHTML = `<img id="profile-image" src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content"><img src="${childData.url}"></img></span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
                    }
                }
                else {
                    if (created == user) {
                        message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content"><video controls src="${childData.url}"></video></span></div></div><img src="${myAvatar}" alt="">`;
                    }
                    else {
                        message.innerHTML = `<img id="profile-image" src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content"><video controls src="${childData.url}"></video></span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
                    }
                }
            }
            messages.appendChild(message);
            loadLatestMessage();
            const messageContent = message.querySelector('#message-content');
            loadEmojisFromDatabase(childKey, messageContent);
            checkMessageFunctions(messageContent);
            const profileImage = message.querySelector('#profile-image');
            if (profileImage) {
                if (!threadUser.includes('Group_')) {
                    profileImage.addEventListener('click', () => showProfile(threadUser));
                }
                else {
                    profileImage.addEventListener('click', () => showProfile(childData.uid));
                }
            }
        });
    });
    messages.scrollTop = messages.scrollHeight;
    loadDelMenus();
    loadEmojiMenus();
}
function clearChatMessages() {
    const messages = document.querySelector('.messages');
    messages.innerHTML = ``;
}
async function checkMessageFunctions(message) {
    let message_content = message.innerHTML;
    if (message_content.includes('<img>') || message_content.includes('<video>'))
        return;
    const uid = auth.currentUser.uid;
    const user_data = await rdb.ref(`users/${uid}`).once('value');
    if (message_content.includes(`@${user_data.val().nickname}`)) {
        message_content = message_content.replace(`@${user_data.val().nickname}`, `<span id="mention">@${user_data.val().nickname}</span>`);
    }
    if (message_content.includes('@everyone')) {
        message_content = message_content.replace('@everyone', `<span id="mention">@everyone</span>`);
    }
    if (message_content.includes('https://')) {
        const urlRegex = /https?:\/\/\S+/g;
        const urls = message_content.match(urlRegex);
        if (urls) {
            urls.forEach((url) => {
                message_content = message_content.replace(url, `<span id="link" onclick="openLink('${url}')">${url}</span>`);
            });
        }
    }
    message.innerHTML = message_content;
}
function openLink(link) {
    window.open(link, "_blank");
}
const imageInput = document.querySelector("#file-upload");
imageInput.addEventListener("change", (e) => {
    const file = imageInput.files[0];
    const reader = new FileReader;
    reader.addEventListener("load", async () => {
        const uid = auth.currentUser.uid;
        const user = auth.currentUser.email;
        await getDate();
        await loadUser();
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
    if (input.value == '')
        return;
    if (input.value.length == (input.value.split(' ').length - 1))
        return;
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
        const childKey = data.key;
        sendMessage(data.val(), childKey);
    });
    chat.on('child_changed', (data) => {
        const message_ID = data.key;
        const msgButton = document.querySelector(`button#${message_ID}`);
        if (msgButton != undefined) {
            const msgSpan = msgButton.parentElement.children[1];
            const emojisRef = `messages/${threadID}/${message_ID}/emojis/added`;
            rdb.ref(emojisRef).once('value', function (snapshot) {
                if (snapshot.exists()) {
                    loadEmojisFromDatabase(message_ID, msgSpan);
                }
                else {
                    deleteEmoji(message_ID, msgSpan);
                }
            });
        }
    });
}
async function sendMessage(childData, childKey) {
    await getThreadUser();
    if (threadUser == '') {
        return;
    }
    if (childKey == 'url')
        return;
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
    await getThreadAvatar();
    if (!childData.url) {
        if (created == user) {
            message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content">${childData.message}</span></div></div><img src="${myAvatar}" alt="">`;
        }
        else {
            message.innerHTML = `<img id="profile-image" src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content">${childData.message}</span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
        }
    }
    else {
        if (childData.url.includes('data:image')) {
            if (created == user) {
                message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content"><img src="${childData.url}"></img></span></div></div><img src="${myAvatar}" alt="">`;
            }
            else {
                message.innerHTML = `<img id="profile-image" src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content"><img src="${childData.url}"></img></span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
            }
        }
        else {
            if (created == user) {
                message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content"><video controls src="${childData.url}"></video></span></div></div><img src="${myAvatar}" alt="">`;
            }
            else {
                message.innerHTML = `<img id="profile-image" src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content"><video controls src="${childData.url}"></video></span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
            }
        }
    }
    const messages = document.querySelector('.messages');
    await messages.appendChild(message);
    const messageContent = message.querySelector('#message-content');
    checkMessageFunctions(messageContent);
    loadEmojisFromDatabase(childKey, messageContent);
    const profileImage = message.querySelector('#profile-image');
    if (profileImage) {
        if (!threadUser.includes('Group_')) {
            profileImage.addEventListener('click', () => showProfile(threadUser));
        }
        else {
            profileImage.addEventListener('click', () => showProfile(childData.uid));
        }
    }
    messages.scrollTop = messages.scrollHeight;
    loadLatestMessage();
    loadDelMenus();
    loadEmojiMenus();
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
                    friend: myNickname,
                    uid: threadUser
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
const accountSpan = document.querySelector('#accountSpan');
let inEditProfile = false;
accountSpan.addEventListener('click', () => showEditBIO());
function showEditBIO() {
    if (!inEditProfile) {
        const uid = auth.currentUser.uid;
        inEditProfile = true;
        showProfile(uid);
    }
    else {
        showProfile('');
    }
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
        if (snapshot.val().url == undefined) {
            threadAvatar = './src/assets/images/logo-bg.png';
        }
        else {
            threadAvatar = snapshot.val().url;
        }
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
const logoutSpan = document.querySelector('#logoutSpan');
const accountSettings = document.querySelector('.account-settings');
showAccountSettingsButton.addEventListener('click', () => showAccountSettings());
function showAccountSettings() {
    accountSettings.classList.toggle('show');
}
logoutSpan.addEventListener('click', () => logout());
async function logout() {
    isWindowActive = false;
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
        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let currentDate = `${day}.${month}.${year}`;
        const advanced_data = {
            created: currentDate,
            bio: "It's my bio!"
        };
        await database_ref.child(`users/${uid}`).set(data);
        await database_ref.child(`users/${uid}/info`).set(advanced_data);
        window.location.reload();
    })
        .catch(function (error) {
        let error_message = error.message;
        console.error(error_message);
    });
}
//# sourceMappingURL=app.js.map