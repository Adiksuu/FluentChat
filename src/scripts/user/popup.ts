let currentAuth = 'register'
setTimeout(() => {
    checkAuth()
}, 1000);

function userManage(auth: string) {
    currentAuth = auth
    checkAuth()
}
function checkAuth() {
    if (!auth.currentUser) {
        const userManage: HTMLDivElement = document.querySelector('.user-manage')
        userManage.classList.add('show')


        if (currentAuth == 'register') {
            const container_reg = document.querySelector('#container_reg')
            const container_log = document.querySelector('#container_log')

            container_reg.classList.remove('hide')
            container_log.classList.add('hide')
        } else {
            const container_reg = document.querySelector('#container_reg')
            const container_log = document.querySelector('#container_log')
            
            container_reg.classList.add('hide')
            container_log.classList.remove('hide')
        }
    }
}