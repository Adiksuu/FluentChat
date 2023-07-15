const imageChangeInput: HTMLInputElement = document.querySelector("#image-upload");

imageChangeInput.addEventListener("change", () => {
    const file: any = imageChangeInput.files[0];
    const reader = new FileReader();
    
    reader.addEventListener('load', () => {
        const uid: string = auth.currentUser.uid
        if (reader.result) {
            const data: any = {
                url: reader.result,
            };
            rdb.ref(`users/${uid}/`).update(data)
        } else return
    })

    reader.readAsDataURL(file);
});

setTimeout(() => {
    if (!auth.currentUser) return

    const imageToChange: HTMLImageElement = document.querySelector('#imageToChange')
    const uid: string = auth.currentUser.uid

    rdb.ref(`users/${uid}/`).once('value', function (snapshot: any) {
        if (!snapshot.exists() || !snapshot.val().url) return

        imageToChange.src = snapshot.val().url
    })
}, 1500);