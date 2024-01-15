
$(document).ready(function () {
    console.log('login *** Water Springs 14/01/2024')

    const URL_LOGIN = conf.server_domain + ':' + conf.server_port + '/' + conf.server_login_path;
    console.log('uuu', URL_LOGIN);

    $("#login-form").on("submit", function () {
        let  login = $('#login').val()
        let  pass = $('#pass').val()

        axios.post(URL_LOGIN, {
            username: login,
            password: pass
        })
            .then(function (response) {
                console.log('creds:', login, pass)
                console.log('response', response.data);
                
                const token = response.data.token

                if (token) {
                    localStorage.setItem('token', response.data.token)
                    localStorage.setItem('username', login)
                } else {
                    console.log ('Token is undefined...')
                }

                window.location.pathname = '/admin/index.html'
            })
            .catch(function (error) {
                console.log('LOGIN MISTAKER');
                console.log(error);
            });

        return false;
    })

    let token = localStorage.getItem('token');

});