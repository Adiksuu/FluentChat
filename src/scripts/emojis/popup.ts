const showEmoji: HTMLButtonElement = document.querySelector('#showEmoji')

showEmoji.addEventListener('click', () => {
    const emojisPopup: HTMLDivElement = document.querySelector('.emojis-popup')

    emojisPopup.classList.toggle('show')
})