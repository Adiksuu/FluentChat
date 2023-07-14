async function loadGroupsFromDatabase() {

    if (!auth.currentUser) return

    const uid: string = auth.currentUser.uid
    const friendsList: HTMLDivElement = document.querySelector('.friends-list')

    await rdb.ref(`users/${uid}/groups/`).once("value", function (snapshot: any) {
        snapshot.forEach(async function (childSnapshot: any) {
            const childData = childSnapshot.val();  
            
                const friend = document.createElement('div')
                const friendID: any = friendsList.childElementCount - 1
            
                let friendDescription: string = "Let's start chat!"
            
                friend.classList.add('friend')
                friend.id = friendID
                await rdb.ref(`groups/${childData.groupID}`).once('value', function (snapshot: any) {
                    friend.innerHTML = `<img src="./src/assets/images/logo-bg.png" alt=""><div><h2>${snapshot.val().customGroupName}</h2><span>${friendDescription}</span></div>`
                })
            
                friendsList.appendChild(friend)
                friend.addEventListener('click', () => selectFriend(friendID, childData.groupName))
        });
    });
}

window.setTimeout(() => {
    loadGroupsFromDatabase()
}, 1000)