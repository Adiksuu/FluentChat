function loginCheck() {
    const log_email: HTMLInputElement = document.querySelector("#log_email");
    const log_password: HTMLInputElement =
        document.querySelector("#log_password");

    if (log_email.value == "" || !log_email.value.includes("@")) {
        log_email.classList.add("error");
        return
    } else {
        log_email.classList.remove("error");
    }
    if (log_password.value == "" || log_password.value.length < 8) {
        log_password.classList.add("error");
        return
    } else {
        log_password.classList.remove("error");
    }

    login(log_email.value, log_password.value)
}

window.setTimeout(() => {
    if (auth.currentAuth) return
    const log_form: HTMLFormElement = document.querySelector("#log_form");

    log_form.addEventListener("submit", (event) => {
        event.preventDefault();

        loginCheck();
    });

    const show_pass: HTMLElement = document.querySelector("#show_pass");
    const log_password: HTMLInputElement =
        document.querySelector("#log_password");

    show_pass.addEventListener("click", () => {
        if (log_password.type == "password") {
            log_password.type = "text";
            show_pass.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            log_password.type = "password";
            show_pass.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
}, 2000);

function login(email: String, password: String) {
    auth.signInWithEmailAndPassword(email, password)
        .then(function () {
            window.location.reload()
        })
        .catch(function (error: any) {
            let error_message = error.message;

            console.error(error_message);
        });
}