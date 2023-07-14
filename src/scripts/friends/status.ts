let isWindowActive = true;

window.addEventListener("beforeunload", () => {
  const uid = auth.currentUser.uid;
  firebase.database().ref(`users/${uid}/isWindowActive`).set(false);
});


function checkWindowStatus() {

  if (!auth.currentUser) return

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