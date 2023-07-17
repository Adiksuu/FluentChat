function loadEmojiMenus() {
    const buttons = document.querySelectorAll('button[id*="emoji_"]');

    buttons.forEach((button) => {
        button.addEventListener("click", () =>
            addEmojiMessage(button.id, button)
        );
    });
}

async function addEmojiMessage(ID: string, button: any) {
    await getThreadUser();
    let threadID: any;
    const uid = auth.currentUser.uid;

    if (!threadUser.includes("Group_")) {
        threadID = [uid, threadUser].sort().join(",");
    } else {
        threadID = threadUser;
    }

    const emojiRef = `messages/${threadID}/${ID.replace(
        "emoji_",
        "message_"
    )}/emojis/user_${uid}`;

    const ref = await rdb.ref(emojiRef);

    ref.once("value", async function (snapshot: any) {
        const data = {
            user: uid,
        };

        if (snapshot.exists()) {
            ref.remove();
        } else {
            ref.set(data);
        }
        loadEmojisFromDatabase(ID.replace('emoji_', 'message_'), button.parentElement.children[0]);
    });
}

function deleteEmoji(message_ID: string, message: HTMLSpanElement) {
    let threadID: any;
    const uid = auth.currentUser.uid;

    if (!threadUser.includes("Group_")) {
        threadID = [uid, threadUser].sort().join(",");

        rdb.ref(`messages/${threadID}/${message_ID}/emojis/`).once("value", function (snapshot: any) {
            if (snapshot.exists()) return;

            message.innerHTML = message.innerHTML.replace('<a>😀</a>', '')
        });
    }
}

function loadEmojisFromDatabase(message_ID: string, message: HTMLSpanElement) {
    let threadID: any;
    const uid = auth.currentUser.uid;

    if (!threadUser.includes("Group_")) {
        threadID = [uid, threadUser].sort().join(",");

        rdb.ref(`messages/${threadID}/${message_ID}/emojis/`).once(
            "value",
            function (snapshot: any) {
                if (!snapshot.exists()) {
                    deleteEmoji(message_ID, message)
                    return
                }

                snapshot.forEach(function (childSnapshot: any) {
                    const emoji: HTMLAnchorElement = document.createElement("a");
                    emoji.innerHTML = "😀";
                    message.appendChild(emoji);
                });
            }
        );
    }
}

