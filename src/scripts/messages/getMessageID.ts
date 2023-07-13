let msgID: number = 0
async function getMessageID(threadID: any) {
    await rdb.ref(`messages/${threadID.sort()}`).once("value", function (snapshot: any) {
        msgID = snapshot.numChildren()
    })
}