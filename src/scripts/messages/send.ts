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

let initialLoad = true; // zmienna do śledzenia pierwszego załadowania wiadomości

function addListenerToMessage() {
    const uid: string = auth.currentUser.uid;
  
    // GET THREAD USER
    getThreadUser().then(async () => {
      const threadID = [uid, threadUser];
  
      const chat: any = rdb.ref(`messages/${threadID.sort()}`);
  
      chat.orderByKey().limitToLast(1).on('child_added', (data: any) => {
        if (initialLoad) {
          initialLoad = false;
          return;
        }
  
        // Dodaj tylko ostatnią dodaną wiadomość, jeśli nie jest autorstwa aktualnego użytkownika
        const created: string = data.val().author;
        const user: string = auth.currentUser.email;
        if (created !== user) {
          sendMessage(data.val());
        }
      });
    });
  }
  


async function sendMessage(childData: any) {
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
  
    // TYPE MESSAGE CONTENT
    if (!childData.url) {
      if (created == user) {
        message.innerHTML = `<div><h2>${childData.nickname}</h2><span>${childData.message}</span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
      } else {
        message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span>${childData.message}</span></div>`;
      }
    } else {
      if (childData.url.includes('data:image')) {
        if (created == user) {
          message.innerHTML = `<div><h2>${childData.nickname}</h2><span><img src="${childData.url}"></img></span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
        } else {
          message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span><img src="${childData.url}"></img></span></div>`;
        }
      } else {
        if (created == user) {
          message.innerHTML = `<div><h2>${childData.nickname}</h2><span><video src="${childData.url}"></video></span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
        } else {
          message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span><video src="${childData.url}"></video></span></div>`;
        }
      }
    }
  
    // APPEND MESSAGE TO CHAT
    const messages: HTMLDivElement = document.querySelector('.messages');
    await messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight
  }
  

async function sendMessageToDatabase(msg: string) {
    // GET UID OF CURRENT USER
    const uid: string = auth.currentUser.uid;
    const user: string = auth.currentUser.email;

    // CREATE DATA TO PUBLISH
    const data = {
        message: msg,
        author: user,
        nickname: userNickname,
    };

    // CREATE THREAD-ID
    await getThreadUser();
    const threadID = [uid, threadUser];

    // CREATE MESSAGE ID
    await getMessageID(threadID);

    // PUBLISH DATA TO DATABASE
    const messageIdWithLeadingZeros = `message_${msgID.toString().padStart(8, '0')}`;
    await rdb.ref(`messages/${threadID.sort()}/${messageIdWithLeadingZeros}`).set(data);

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
    sendMessage(data);
}