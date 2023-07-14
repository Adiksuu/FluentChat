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

    // CREATE THREAD-ID 
    await getThreadUser()
    let threadID: any
    if (!threadUser.includes('Group_')) {
      threadID = [uid,threadUser]
    } else {
      threadID = threadUser
      await rdb.ref(`messages/${threadID}`).once("value", function (snapshot: any) {
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
                message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content">${childData.message}</span></div></div><img src="./src/assets/images/logo-bg.png" alt="">`;
              } else {
                message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span id="message-content">${childData.message}</span></div>`;
              }
            } else {
              if (childData.url.includes('data:image')) {
                if (created == user) {
                  message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span><img src="${childData.url}"></img></span></div></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                } else {
                  message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span><img src="${childData.url}"></img></span></div>`;
                }
              } else {
                if (created == user) {
                  message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span><video src="${childData.url}"></video></span></div></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                } else {
                  message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span><video controls src="${childData.url}"></video></span></div>`;
                }
              }
            }
            
            // APPEND MESSAGE TO CHAT
            messages.appendChild(message)
            loadLatestMessage()
            messages.scrollTop = messages.scrollHeight
          });
        });
        loadDelMenus()
      return
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
                message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span id="message-content">${childData.message}</span></div></div><img src="./src/assets/images/logo-bg.png" alt="">`;
              } else {
                message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span id="message-content">${childData.message}</span></div>`;
              }
            } else {
              if (childData.url.includes('data:image')) {
                if (created == user) {
                  message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span><img src="${childData.url}"></img></span></div></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                } else {
                  message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span><img src="${childData.url}"></img></span></div>`;
                }
              } else {
                if (created == user) {
                  message.innerHTML = `<div><h2>${childData.nickname} ${childData.date}</h2><div id="message-options"><button id="${childKey}"><i class="fas fa-trash"></i></button><span><video src="${childData.url}"></video></span></div></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                } else {
                  message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname} ${childData.date}</h2><span><video controls src="${childData.url}"></video></span></div>`;
                }
              }
            }
            
            // APPEND MESSAGE TO CHAT
            messages.appendChild(message)
            loadLatestMessage()
          });
        });
        
        messages.scrollTop = messages.scrollHeight
        loadDelMenus()
}

function clearChatMessages() {
    const messages: HTMLDivElement = document.querySelector('.messages')

    messages.innerHTML = ``
}