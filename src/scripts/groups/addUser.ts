function addUserToGroup(groupID: string, userUID: string) {
    const data = {
        groupID: groupID,
        groupName: `Group_${groupID}`,
    }
    const userData = {
        userUID: userUID
    }

    rdb.ref(`users/${userUID}/groups/${groupID}`).set(data)
    rdb.ref(`groups/${groupID}/users/${userUID}`).set(userData)
}

const addUserInput: HTMLInputElement = document.querySelector('#addUserInput')
const addUserSubmit: HTMLButtonElement = document.querySelector('#addUserSubmit')

addUserSubmit.addEventListener('click', async () => {
    if (addUserInput.value == auth.currentUser.email) {
        addUserInput.value = ''
        return
    }

    await rdb.ref(`users/`).once("value", function (snapshot: any) {
        snapshot.forEach(function (childSnapshot: any) {
            const childData = childSnapshot.val();  
            
            if (childData.email == addUserInput.value) {
                addUserToGroup(threadUser.replace('Group_', ''), childData.uid)
                addUserInput.value = ''
                return            
            }
        });
    });
})