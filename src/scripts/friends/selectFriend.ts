async function selectFriend(id: number, friendName: string) {
    const friendsList: HTMLDivElement = document.querySelector('.friends-list')

    await resetActives()

    friendsList.children[id + 1].classList.add('active')
    await changeChatSelect(friendName)
    addListenerToMessage()
}

function resetActives() {
    const friendsList: HTMLDivElement = document.querySelector('.friends-list')
    for (let i = 0; i < friendsList.childElementCount - 1; i++) {
        friendsList.children[i + 1].classList.remove('active')
    }
}

function changeChatSelect(friendName: string) {
    threadUserElement.textContent = friendName

    loadMessages()
}