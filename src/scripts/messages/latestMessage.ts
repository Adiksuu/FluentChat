let messageSpan: NodeListOf<Element> = document.querySelectorAll('#message-content')
let friendActive = document.querySelector('.friend.active')

function loadLatestMessage() {
    messageSpan = document.querySelectorAll('#message-content')
    friendActive = document.querySelector('.friend.active')

    const messageSpanContent = messageSpan[messageSpan.length - 1].textContent
    friendActive.children[1].children[1].textContent = messageSpanContent
    friendActive.children[1].children[1].textContent =  friendActive.children[1].children[1].textContent.substr(0, 18)
}