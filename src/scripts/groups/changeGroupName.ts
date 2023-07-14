function editGroupName() {
    const changeGroupDiv: HTMLDivElement = document.querySelector('#changeGroupDiv')
    const addUserDiv: HTMLDivElement = document.querySelector('#addUserDiv')

    changeGroupDiv.classList.toggle('show')
    addUserDiv.classList.remove('show')
}
const groupNameInput: HTMLInputElement = document.querySelector('#groupNameInput')
const groupNameSubmit: HTMLButtonElement = document.querySelector('#groupNameSubmit')

groupNameSubmit.addEventListener('click', () => submitGroupName())

async function submitGroupName() {
    const data = {
        customGroupName: groupNameInput.value
    }

    await rdb.ref(`groups/${threadUser.replace('Group_', '')}`).update(data)

    window.location.reload()
}

function loadGroupName() {
    if (threadUser.includes('Group_')) {
        rdb.ref(`groups/${threadUser.replace('Group_', '')}`).once('value', function (snapshot: any) {
            threadUserElement.textContent = snapshot.val().customGroupName
        })
    }
}