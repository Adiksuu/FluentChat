const callOption: NodeListOf<Element> = document.querySelectorAll('.call-option')

callOption.forEach(option => {
    option.addEventListener('click', () => {
        option.classList.toggle('disable')
    })
})

const muteOption: HTMLButtonElement = document.querySelector('.call-option-mute')
const videoOption: HTMLButtonElement = document.querySelector('.call-option-video')

muteOption.addEventListener('click', () => {
    if (muteOption.innerHTML == '<i class="fas fa-microphone"></i>') {
        muteOption.innerHTML = '<i class="fas fa-microphone-slash"></i>'
    } else {
        muteOption.innerHTML = '<i class="fas fa-microphone"></i>'
    }
})

videoOption.addEventListener('click', () => {
    if (videoOption.innerHTML == '<i class="fas fa-video"></i>') {
        videoOption.innerHTML = '<i class="fas fa-video-slash"></i>'
    } else {
        videoOption.innerHTML = '<i class="fas fa-video"></i>'
    }
})