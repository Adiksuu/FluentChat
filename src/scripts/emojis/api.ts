const emojiAPI: string = 'baf1112db07c91085f26890bbab13a83ac591cc4'

fetch('https://emoji-api.com/emojis?access_key=34f6266993937b3fe71703a6080917b93b76f944')
   .then(res => res.json())
   .then(data => loadEmojis(data));

const emojiList = document.querySelector('.emoji-list')

const emojiFace = document.querySelector('.emoji-face')
const emojiAnimals = document.querySelector('.emoji-animals')
const emojiFood = document.querySelector('.emoji-food')
const emojiTransport = document.querySelector('.emoji-transport')
const emojiExtra = document.querySelector('.emoji-extra')
const emojiIcons = document.querySelector('.emoji-icons')
const emojiFlags = document.querySelector('.emoji-flags')

const addedEmojis: any[] = [];

function loadEmojis(data: any) {
  data.forEach((emoji: any) => {
      if (!addedEmojis.includes(emoji.character)) {
        let button = document.createElement('button');
        button.textContent = emoji.character;
        button.addEventListener('click', () => addEmoji(emoji.character))

      if (emoji.group === "smileys-emotion" || emoji.group === "people-body") {
        emojiFace.appendChild(button);
      }
      else if (emoji.group === "animals-nature") {
        emojiAnimals.appendChild(button);
      }
      else if (emoji.group === "food-drink") {
        emojiFood.appendChild(button);
      }
      else if (emoji.group === "travel-places") {
        emojiTransport.appendChild(button);
      }
      else if (emoji.group === "objects" || emoji.group === "activities") {
        emojiExtra.appendChild(button);
      }
      else if (emoji.group === "symbols") {
        emojiIcons.appendChild(button);
      }
      else if (emoji.group === "flags") {
        emojiFlags.appendChild(button);
      }

      addedEmojis.push(emoji.character);
    }
  });
}

function addEmoji(emoji: any) {
    const input: any = document.querySelector('#sendMessageInput')

    input.value += emoji
}