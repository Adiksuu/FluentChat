async function loadMessages() {
  // CLEAR MESSAGES
  clearChatMessages()
  
  // GET THREAD USER
  await getThreadUser()
  if (threadUser == '') {
      return
  }

  // GET UID OF CURRENT USER
  const uid: string = auth.currentUser.uid
  const user: string = auth.currentUser.email

  const messages: HTMLDivElement = document.querySelector('.messages')

  const firstMessage: HTMLDivElement = document.createElement('div')
  firstMessage.classList.add('first-message')
  firstMessage.innerHTML = `<span>This is the beginning of a beautiful conversation</span>`

  messages.appendChild(firstMessage)
  getMyAvatar()

  // CREATE THREAD-ID 
  await getThreadUser()
  getThreadAvatar()
  let threadID: any
  if (!threadUser.includes('Group_')) {
    threadID = [uid,threadUser]
  } else {
    threadID = [threadUser]
  }
  // GET MESSAGES
  await rdb.ref(`messages/${threadID.sort()}`).once("value", function (snapshot: any) {
      snapshot.forEach(function (childSnapshot: any) {
          const childData = childSnapshot.val();  
          const childKey = childSnapshot.key

          // CREATE NEW DIV
          const message: HTMLDivElement = document.createElement('div')

          // CHECK IF MESSAGE IS CREATED BY...
          const created: string = childData.author

          // ADD CLASSES TO MESSAGE DIV
          if (created == user) {
              message.classList.add('message', 'author')
          } else {
              message.classList.add('message')
          }

          // TYPE MESSAGE CONTENT
          if (!childData.url) {
            if (created == user) {
              message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content">${childData.message}</span></div></div><img src="${myAvatar}" alt="">`;
            } else {
              message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content">${childData.message}</span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
            }
          } else {
            if (childData.url.includes('data:image')) {
              if (created == user) {
                message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content"><img src="${childData.url}"></img></span></div></div><img src="${myAvatar}" alt="">`;
              } else {
                message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content"><img src="${childData.url}"></img></span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
              }
            } else {
              if (created == user) {
                message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content"><video controls src="${childData.url}"></video></span></div></div><img src="${myAvatar}" alt="">`;
              } else {
                message.innerHTML = `<img src="${threadAvatar}" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><span id="message-content"><video controls src="${childData.url}"></video></span><button id="${childKey.replace('message_', 'emoji_')}"><i class="fas fa-smile"></i></button></div></div>`;
              }
            }
          }
          
          // APPEND MESSAGE TO CHAT
          messages.appendChild(message)
          loadLatestMessage()

          const messageContent: HTMLSpanElement = message.querySelector('#message-content');

          loadEmojisFromDatabase(childKey, messageContent);
        });
      });
      
      messages.scrollTop = messages.scrollHeight
      loadDelMenus()
      loadEmojiMenus()
}

function clearChatMessages() {
  const messages: HTMLDivElement = document.querySelector('.messages')

  messages.innerHTML = ``
}