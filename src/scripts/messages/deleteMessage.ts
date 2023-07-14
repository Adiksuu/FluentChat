document.addEventListener("contextmenu", function (event: any) {
    event.preventDefault();
});

function loadDelMenus() {
    const buttons = document.querySelectorAll('button[id*="message_"]');

    buttons.forEach((button) => {
        button.addEventListener('click', () => deleteMessage(button.id))
    });
}

async function deleteMessage(ID: string) {
    await getThreadUser();
    let threadID: any
    const uid = auth.currentUser.uid

    if (!threadUser.includes('Group_')) {
      threadID = [uid, threadUser];
      rdb.ref(`messages/${threadID.sort().join(',')}/${ID}`).remove()
    } else {
      threadID = threadUser
      rdb.ref(`messages/${threadID}/${ID}`).remove()
    }

    await rdb.ref(`messages/${threadID}/${ID}`).remove()
    window.location.reload()
}
