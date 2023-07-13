// GET AUTHOR OF MESSAGE
let msgAuthor: string = ''
let userNickname: string = ''

window.setTimeout(() => {

    if (!auth.currentUser) return

    const uid: string = auth.currentUser.uid
    
    rdb.ref(`users/${uid}`).once('value', function (snapshot: any) {
        msgAuthor = snapshot.val().nickname
        userNickname = snapshot.val().nickname
    })
}, 1000)