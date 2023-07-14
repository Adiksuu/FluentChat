let isWindowActive = true;

window.addEventListener("beforeunload", () => {
  if (!auth.currentUser) return
  if (threadUser.includes('Group_')) return

  const uid = auth.currentUser.uid;
  firebase.database().ref(`users/${uid}/isWindowActive`).set(false);
});


function checkWindowStatus() {

  if (!auth.currentUser) return
  if (threadUser.includes('Group_')) {
    const activeStatus: HTMLSpanElement = document.querySelector('#activeStatus')
    rdb.ref(`groups/${threadUser.replace('Group_', '')}/users/`).once('value', function (snapshot: any) {
      if (!snapshot.exists()) return
      activeStatus.innerHTML = `<div class="status"></div> Group | ${snapshot.numChildren()} members <button onclick="toggleAddUsers()"><i class="fas fa-plus"></i></button><button onclick="editGroupName()"><i class="fas fa-pencil"></i></button>`
    })
    return
  }

  if (!document.hidden) {
    isWindowActive = true;
  } else {
    isWindowActive = false;
  }

  const uid = auth.currentUser.uid;
  firebase.database().ref(`users/${uid}/isWindowActive`).set(isWindowActive);

  const activeStatus: HTMLSpanElement = document.querySelector('#activeStatus')
    rdb.ref(`users/${threadUser}/`).once('value', function (snapshot: any) {
        const userIsActive: boolean = snapshot.val().isWindowActive

        if (userIsActive) {
            activeStatus.innerHTML = '<div class="status"></div> Online'
            return
        }
        activeStatus.innerHTML = '<div class="status offline"></div> Offline'
    });
}

window.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("visibilitychange", checkWindowStatus);

  setInterval(checkWindowStatus, 3000);
});