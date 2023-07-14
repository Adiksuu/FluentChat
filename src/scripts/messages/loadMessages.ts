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
                message.innerHTML = `<div><h2>${childData.nickname}</h2><span id="message-content">${childData.message}</span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
              } else {
                message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span id="message-content">${childData.message}</span></div>`;
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
                  message.innerHTML = `<div><h2>${childData.nickname}</h2><span><video controls src="${childData.url}"></video></span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                } else {
                  message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span><video controls src="${childData.url}"></video></span></div>`;
                }
              }
            }
            
            // APPEND MESSAGE TO CHAT
            messages.appendChild(message)
            loadLatestMessage()
            messages.scrollTop = messages.scrollHeight
        });
    });
      return
    }
    // GET MESSAGES
    await rdb.ref(`messages/${threadID.sort()}`).once("value", function (snapshot: any) {
        snapshot.forEach(function (childSnapshot: any) {
            const childData = childSnapshot.val();  

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
                message.innerHTML = `<div><h2>${childData.nickname}</h2><span id="message-content">${childData.message}</span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
              } else {
                message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span id="message-content">${childData.message}</span></div>`;
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
                  message.innerHTML = `<div><h2>${childData.nickname}</h2><span><video controls src="${childData.url}"></video></span></div><img src="./src/assets/images/logo-bg.png" alt="">`;
                } else {
                  message.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span><video controls src="${childData.url}"></video></span></div>`;
                }
              }
            }
            
            // APPEND MESSAGE TO CHAT
            messages.appendChild(message)
            loadLatestMessage()

        });
    });

    messages.scrollTop = messages.scrollHeight
}

function clearChatMessages() {
    const messages: HTMLDivElement = document.querySelector('.messages')

    messages.innerHTML = ``
}