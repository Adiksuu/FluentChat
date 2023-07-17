let msgID: number = 0;

async function getMessageID(threadID: any) {
    let snapshot: any;

    if (!threadUser.includes('Group_')) {
        snapshot = await rdb.ref(`messages/${threadID.sort()}`).once("value");
    } else {
        snapshot = await rdb.ref(`messages/${threadID}`).once("value");
    }

    if (snapshot.val() == null) {
        msgID = 0
        return
    }
    const messageIDs = Object.keys(snapshot.val());

    // Sprawdzenie, które message_ID są dostępne
    const availableMessageIDs = [];
    for (const messageID of messageIDs) {
        const numberPart = messageID.split("_")[1];
        availableMessageIDs.push(parseInt(numberPart));
    }

    // Znalezienie największego message_ID
    const maxMessageID = Math.max(...availableMessageIDs);

    // Zwiększenie msgID o 1
    msgID = maxMessageID + 1;
}
