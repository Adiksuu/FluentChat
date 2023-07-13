function registerCheck() {
    const reg_nickname: HTMLInputElement =
        document.querySelector("#reg_nickname");
    const reg_email: HTMLInputElement = document.querySelector("#reg_email");
    const reg_password: HTMLInputElement =
        document.querySelector("#reg_password");

    if (reg_nickname.value == "") {
        reg_nickname.classList.add("error");
        return
    } else {
        reg_nickname.classList.remove("error");
    }
    if (reg_email.value == "" || !reg_email.value.includes("@")) {
        reg_email.classList.add("error");
        return
    } else {
        reg_email.classList.remove("error");
    }
    if (reg_password.value == "" || reg_password.value.length < 8) {
        reg_password.classList.add("error");
        return
    } else {
        reg_password.classList.remove("error");
    }

    register(reg_email.value, reg_password.value, reg_nickname.value)
}

window.setTimeout(() => {
    if (auth.currentAuth) return
    const reg_form: HTMLFormElement = document.querySelector("#reg_form");

    reg_form.addEventListener("submit", (event) => {
        event.preventDefault();

        registerCheck();
    });

    const show_pass: HTMLElement = document.querySelector("#show_pass");
    const reg_password: HTMLInputElement =
        document.querySelector("#reg_password");

    show_pass.addEventListener("click", () => {
        if (reg_password.type == "password") {
            reg_password.type = "text";
            show_pass.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            reg_password.type = "password";
            show_pass.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
}, 2000);

function register(email: String, password: String, nickname: String) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(async function () {
            let database_ref = rdb.ref();

            const uid = auth.currentUser.uid

            const data = {
                email: email,
                password: password,
                nickname: nickname,
                uid: uid
            }
            await database_ref.child(`users/${uid}`).set(data);
            window.location.reload()
        })
        .catch(function (error: any) {
            let error_message = error.message;

            console.error(error_message);
        });
}