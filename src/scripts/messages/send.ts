const sended_message: HTMLFormElement = document.querySelector('#sended_message')

async function sendMessageAsButton() {
  // ADD MESSAGE TO A CHAT
  const input: any = sended_message.children[0]
  // GET THREAD USER
  await getThreadUser()
  if (threadUser == '') {
      return
  }
  // ADD MESSAGE TO A DATABASE
  await sendMessageToDatabase(input.value)

  // CLEAR INPUT
  input.value = ''
}

sended_message.addEventListener('submit', async (e: SubmitEvent) => {
    // DO NOT REFRESH
    e.preventDefault()

    // SEND MESSAGE
    sendMessageAsButton()
})

let chatRef: any = null; // Referencja do aktualnego czatu

async function addListenerToMessage() {
  const uid: string = auth.currentUser.uid;

  // Wyłącz poprzednie nasłuchiwanie, jeśli istnieje
  if (chatRef) {
    chatRef.off();
  }

  // GET THREAD USER
  await getThreadUser();

  if (threadUser === '') {
    return;
  }

  let threadID: any
  if (!threadUser.includes('Group_')) {
    threadID = [uid, threadUser].sort().join(',');
  } else {
    threadID = threadUser
  }

  const chat: any = rdb.ref(`messages/${threadID}`);

  chatRef = chat; // Zapisz referencję do aktualnego czatu

  let initialLoad = true; // zmienna do śledzenia pierwszego załadowania wiadomości

  chat.limitToLast(1).on('child_added', (data: any) => {
    if (initialLoad) {
      initialLoad = false;
      return;
    }

    // Dodaj tylko ostatnią dodaną wiadomość, jeśli nie jest autorstwa aktualnego użytkownika
    const created: string = data.val().author;
    const user: string = auth.currentUser.email;

    const childKey = data.key

    if (created !== user) {
      sendMessage(data.val(), childKey);
    }
  });
}
  


async function sendMessage(childData: any, childKey: any) {
    // GET THREAD USER
    await getThreadUser();
    if (threadUser == '') {
      return;
    }
  
    // CREATE NEW DIV
    const message: HTMLDivElement = document.createElement('div');
  
    // CHECK IF MESSAGE IS CREATED BY...
    const created: string = childData.author;
    const user: string = auth.currentUser.email;
  
    // ADD CLASSES TO MESSAGE DIV
    if (created == user) {
      message.classList.add('message', 'author');
    } else {
      message.classList.add('message');
    }
    
    getMyAvatar()
    await getThreadAvatar()
  
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
    const messages: HTMLDivElement = document.querySelector('.messages');
    await messages.appendChild(message);

    const messageContent: HTMLSpanElement = message.querySelector('#message-content');
    loadEmojisFromDatabase(childKey, messageContent);

    messages.scrollTop = messages.scrollHeight

    loadLatestMessage()
    loadDelMenus()
    loadEmojiMenus()
  }
  

async function sendMessageToDatabase(msg: string) {
    // GET UID OF CURRENT USER
    const uid: string = auth.currentUser.uid;
    const user: string = auth.currentUser.email;

    // CREATE DATA TO PUBLISH
    await getDate()
    const data = {
        message: msg,
        author: user,
        nickname: userNickname,
        date: currentDate,
        uid: uid
    };

    // CREATE THREAD-ID
    await getThreadUser();
    let threadID: any
    if (!threadUser.includes('Group_')) {
      threadID = [uid, threadUser];
    } else {
      threadID = threadUser
    }

    // CREATE MESSAGE ID
    await getMessageID(threadID);

    // PUBLISH DATA TO DATABASE
    const messageIdWithLeadingZeros = `message_${msgID.toString().padStart(8, '0')}`;
    if (!threadUser.includes('Group_')) {
      await rdb.ref(`messages/${threadID.sort()}/${messageIdWithLeadingZeros}`).set(data);
    } else {
      await rdb.ref(`messages/${threadID}/${messageIdWithLeadingZeros}`).set(data);
      sendMessage(data, messageIdWithLeadingZeros);
      return
    }

    if (messageIdWithLeadingZeros == 'message_00000000') {
      let myNickname: string = ''

      await rdb.ref(`users/${uid}`).once("value", function (snapshot: any) {
        myNickname = snapshot.val().nickname
      });

      rdb.ref(`users/${threadUser}/friends/friend_${myNickname}`).once("value", function (snapshot: any) {
        if (!snapshot.exists()) {
          const data = {
            friend: myNickname
          }
    
          rdb.ref(`users/${threadUser}/friends/friend_${myNickname}`).set(data)
        }
      });
    }

    // SEND MESSAGE TO DISPLAY
    sendMessage(data, messageIdWithLeadingZeros);
}