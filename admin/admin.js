$(document).ready(function () {
    console.log('admin *** Water Springs 14/01/2024', conf)

    // Tabs
    $('#tabs li a:not(:first)').addClass('inactive');
    $('.tab').hide();
    $('.tab:first').show();

    $('#tabs li a').click(function(){
        var t = $(this).attr('id');
        if($(this).hasClass('inactive')){ //this is the start of our condition
            $('#tabs li a').addClass('inactive');
            $(this).removeClass('inactive');

            $('.tab').hide();
            $('#'+ t + 'C').fadeIn('slow');
        }
    });

    // Exit
    $( ".js-exit" ).on( "click", function() {
        localStorage.setItem('token', '');
        localStorage.setItem('username', '');
        window.location.href = "/";
    });

    // User check
    let token = localStorage.getItem('token')
    if (!token) {
        console.log('login please...')
        window.location.pathname = '/admin/login.html'
    } else {
        let username = localStorage.getItem('username')
        if (username) {
            $('.js-user').text(username)
        } else {
            $('.js-user').hide()
        }
    }


    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const URL = conf.server_domain + ':' + conf.server_port + '/' + conf.server_locations_path;
    console.log('uuu', URL);

    $("#login-form").on("submit", function () {

        regexp = /-?\d{1,3}\.\d+/

        let name = $('#name').val()
        let longitude = $('#longitude').val()
        let latitude = $('#latitude').val()
        let tooltip = $('#tooltip').val()
        let author = $('#author').val()

        let payload = {
            name: name,
            longitude: longitude,
            latitude: latitude,
            tooltip: tooltip,
            author: author
        }

        if ( !regexp.test(latitude) || !regexp.test(longitude) ) {
            console.log('Bad coords');
            return
        }
               
        console.log('creds:', name.length, longitude.length, latitude.length, tooltip, author)

        if (name.length === 0 || name.longitude === 0 || name.longitude === 0) return

        axios.post(
                URL, 
                payload,
                config
            )
            .then(function (response) {

                console.log('response', response.data);
                console.log('The SPRING is added....')
            })
            .catch(function (error) {
                console.log('Something Wrong...');
                console.log(error);
            });

        return false;
    });

});