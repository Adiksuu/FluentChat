const showAccountSettingsButton: HTMLButtonElement = document.querySelector('#showAccountSettings')
const accountSettings: HTMLDivElement = document.querySelector('.account-settings')

showAccountSettingsButton.addEventListener('click', () => showAccountSettings())

function showAccountSettings() {
    accountSettings.classList.toggle('show')
}

accountSettings.addEventListener('click', () => logout())

async function logout() {
    await auth.signOut()
    window.location.reload()
}