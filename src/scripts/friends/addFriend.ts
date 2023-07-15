const addFriendButton: HTMLButtonElement = document.querySelector('#addFriend')

addFriendButton.addEventListener('click', () => {
    const addFriendDiv: HTMLDivElement = document.querySelector('#addFriendDiv')
    addFriendDiv.classList.toggle('show')
})

const addFriendSubmit: HTMLButtonElement = document.querySelector('#addFriendSubmit')

addFriendSubmit.addEventListener('click', () => addFriend())

async function addFriend() {
    const addFriendInput: HTMLInputElement = document.querySelector('#addFriendInput')
    const friendsList: HTMLDivElement = document.querySelector('.friends-list')

    if (addFriendInput.value == auth.currentUser.email) {
        addFriendInput.value = ''
        return
    }

    await rdb.ref(`users/`).once("value", function (snapshot: any) {
        snapshot.forEach(function (childSnapshot: any) {
            const childData = childSnapshot.val();  
            
            if (childData.email == addFriendInput.value) {
                const friend = document.createElement('div')
                const friendID: any = friendsList.childElementCount - 1

                const friendUID = childData.uid
            
                let friendDescription: string = "Let's start chat!"
            
                friend.classList.add('friend')
                friend.id = friendID
                friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.nickname}</h2><span>${friendDescription}</span></div>`
            
                friendsList.appendChild(friend)
                addFriendToDatabase(childData.nickname, friendUID)
                friend.addEventListener('click', () => selectFriend(friendID, childData.nickname))
                addFriendInput.value = ''
                return            
            }
        });
    });

}

function addFriendToDatabase(nickname: string, friendUID: string) {
    const uid: string = auth.currentUser.uid

    const data = {
        friend: nickname,
        uid: friendUID
    }

    rdb.ref(`users/${uid}/friends/friend_${nickname}`).set(data)
}

async function loadFriendsFromDatabase() {

    if (!auth.currentUser) return

    const uid: string = auth.currentUser.uid
    const friendsList: HTMLDivElement = document.querySelector('.friends-list')

    await rdb.ref(`users/${uid}/friends`).once("value", function (snapshot: any) {
        snapshot.forEach(function (childSnapshot: any) {
            const childData = childSnapshot.val();  
            
                const friend = document.createElement('div')
                const friendID: any = friendsList.childElementCount - 1
            
                let friendDescription: string = "Let's start chat!"
            
                friend.classList.add('friend')
                friend.id = friendID
                rdb.ref(`users/${childData.uid}`).once('value', function (snapshot: any) {
                    if (snapshot.val().url) {
                        friend.innerHTML = `<img src="${snapshot.val().url}" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`
                    } else {
                        friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${childData.friend}</h2><span>${friendDescription}</span></div>`
                    }
                })
            
                friendsList.appendChild(friend)
                friend.addEventListener('click', () => selectFriend(friendID, childData.friend))
        });
    });
}

window.setTimeout(() => {
    loadFriendsFromDatabase()
}, 1000)