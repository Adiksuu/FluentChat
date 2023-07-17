const imageChangeInput: HTMLInputElement = document.querySelector("#image-upload");

imageChangeInput.addEventListener("change", () => {
    const file: any = imageChangeInput.files[0];
    const reader = new FileReader();
    
    reader.addEventListener('load', async () => {
        const uid: string = auth.currentUser.uid
        if (reader.result) {
            const data: any = {
                url: reader.result,
            };
            await rdb.ref(`users/${uid}/`).update(data)
            loadAvatar()
        } else return
    })

    reader.readAsDataURL(file);
});

setTimeout(() => {
    loadAvatar()
}, 1500);

function loadAvatar() {
    if (!auth.currentUser) return

    const imageToChange: HTMLImageElement = document.querySelector('#imageToChange')
    const uid: string = auth.currentUser.uid

    rdb.ref(`users/${uid}/`).once('value', function (snapshot: any) {
        if (!snapshot.exists() || !snapshot.val().url) return

        imageToChange.src = snapshot.val().url
    })
}