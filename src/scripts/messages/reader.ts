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
    const threadID = [uid, threadUser];

    // CREATE MESSAGE ID
    await getMessageID(threadID);

    // PUBLISH DATA TO DATABASE
    const messageIdWithLeadingZeros = `message_${msgID.toString().padStart(8, '0')}`;

    firebase.database().ref(`messages/${threadID.sort()}/${messageIdWithLeadingZeros}/`).set(data);

    loadMessages()
  });

  reader.readAsDataURL(file);
});