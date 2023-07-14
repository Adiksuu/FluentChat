const imageInput: any = document.querySelector("#file-upload");

imageInput.addEventListener("change", (e: any) => {
   const file = imageInput.files[0];
  const reader = new FileReader;

  reader.addEventListener("load", async () => {
    const uid: string = auth.currentUser.uid;
    const user: string = auth.currentUser.email;

    const data = {
      author: user,
      nickname: userNickname,
      message: '',
      url: reader.result,
    };

    // CREATE THREAD-ID
    getThreadUser();
    let threadID: any
    if (!threadUser.includes('Group_')) {
      threadID = [uid, threadUser];
    } else {
      threadID = threadUser
    }
    
    if (threadUser == '') {
      return;
    }

    // CREATE MESSAGE ID
    await getMessageID(threadID);

    // PUBLISH DATA TO DATABASE
    const messageIdWithLeadingZeros = `message_${msgID.toString().padStart(8, '0')}`;
    
    if (!threadUser.includes('Group_')) {
      await firebase.database().ref(`messages/${threadID.sort()}/${messageIdWithLeadingZeros}/`).set(data);
    } else {
      await firebase.database().ref(`messages/${threadID}/${messageIdWithLeadingZeros}/`).set(data);
    }

    loadMessages()
  });

  reader.readAsDataURL(file);
});