let msgID: number = 0
async function getMessageID(threadID: any) {
    if (!threadUser.includes('Group_')) {
        await rdb.ref(`messages/${threadID.sort()}`).once("value", function (snapshot: any) {
            msgID = snapshot.numChildren()
        })
    } else {
        await rdb.ref(`messages/${threadID}`).once("value", function (snapshot: any) {
            msgID = snapshot.numChildren()
        })
    }
}