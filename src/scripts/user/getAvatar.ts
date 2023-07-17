let myAvatar: any;
let threadAvatar: any;

async function getMyAvatar() {
    const uid: string = auth.currentUser.uid;

    const snapshot = await rdb.ref(`users/${uid}/`).once('value');
    if (!snapshot.exists() || !snapshot.val().url) {
        myAvatar = './src/assets/images/logo-bg.png';
        return;
    }
    myAvatar = snapshot.val().url;
}

async function getThreadAvatar() {
    if (!threadUser.includes('Group_')) {
      const snapshot = await rdb.ref(`users/${threadUser}/`).once('value');
      if (!snapshot.exists() || !snapshot.val().url) {
        threadAvatar = './src/assets/images/logo-bg.png';
      }
      threadAvatar = snapshot.val().url;
    } else {
      threadAvatar = './src/assets/images/logo-bg.png';
    }
  }