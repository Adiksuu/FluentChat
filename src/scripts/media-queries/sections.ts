const friends: HTMLDivElement = document.querySelector('.friends')
const chat: HTMLDivElement = document.querySelector('.chat')

const toChatsButton: HTMLDivElement = document.querySelector('.toChats')

let activeFriends = document.querySelectorAll('.friend.active')

toChatsButton.children[0].addEventListener('click', () => {
    activeFriends.forEach(element => {
        element.classList.remove('active')
    });
})


window.setInterval(() => {
    activeFriends = document.querySelectorAll('.friend.active')
    
    if (activeFriends.length > 0) {
        friends.classList.add('hide')
        chat.classList.add('show')
    } else {
        friends.classList.remove('hide')
        chat.classList.remove('show')
    }
}, 300)