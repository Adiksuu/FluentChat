function toggleAddUsers() {
    const addUserDiv: HTMLDivElement = document.querySelector('#addUserDiv')
    const changeGroupDiv: HTMLDivElement = document.querySelector('#changeGroupDiv')

    addUserDiv.classList.toggle('show')
    changeGroupDiv.classList.remove('show')
}