async function createGroup() {
    const groupID: number = Math.floor(Math.random() * 9999999)

    const data = {
        id: groupID,
        ownerUID: auth.currentUser.uid,
        groupName: `Group_${groupID}`,
        customGroupName: `Group_${groupID}`
    }

    rdb.ref(`groups/${groupID}`).set(data)
    await addUserToGroup(groupID.toString(), auth.currentUser.uid)
    loadGroupsFromDatabase()
}

const createGroupButton: HTMLButtonElement = document.querySelector('#createGroup')

createGroupButton.addEventListener('click', () => createGroup())