// GET UID OF THREAD USER
let threadUser: string = ''
const threadUserElement: HTMLElement = document.querySelector('#threadUser')

async function getThreadUser() {
    const threadUserNickname: string = threadUserElement.textContent

    if (!threadUserNickname.includes('Group_')) {

        await rdb.ref(`users/`).once("value", function (snapshot: any) {
            snapshot.forEach(function (childSnapshot: any) {
                const childData = childSnapshot.val();  

                if (childData.nickname != threadUserNickname) return
                
                threadUser = childData.uid
            });
        });
    } else {
        await rdb.ref(`groups/`).once("value", function (snapshot: any) {
            snapshot.forEach(function (childSnapshot: any) {
                const childData = childSnapshot.val();  

                if (childData.groupName != threadUserNickname) return

                const id = threadUserNickname
                
                threadUser = id
            });
        });
    }
}