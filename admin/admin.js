let springs = [];
const URL_LOCATIONS = conf.server_domain + ':' + conf.server_port + '/' + conf.server_locations_path;
const updateEvent = new Event('update')

document.addEventListener("update", function() {
    console.log('listener: update')
    updateView();
});

$(document).ready(function () {

    updateData();
    console.log('admin *** Water Springs, ', conf.client_version);

    // Tabs
    $('#tabs li a:not(:first)').addClass('inactive');
    $('.tab').hide();
    $('.tab:first').show();

    $('#tabs li a').click(function(){
        var t = $(this).attr('id');
        if($(this).hasClass('inactive')){
            $('#tabs li a').addClass('inactive');
            $(this).removeClass('inactive');

            $('.tab').hide();
            $('#'+ t + 'C').fadeIn('slow');
        }
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

    const header = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // UI
    $( ".js-exit" ).on( "click", function() {
        console.log('exit..')
        localStorage.setItem('token', '');
        localStorage.setItem('username', '');
        window.location.href = "/";
    });

    $("#new-form").on("submit", function (e) {
        e.preventDefault();
        let isValid = true;
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
            author: localStorage.getItem('username') || ''
        }

        if (name.length === 0 || longitude.length === 0 || latitude.length === 0) {
            console.log('Add spring: Empty Data');
            isValid = false;
        }

        if ( !regexp.test(latitude) || !regexp.test(longitude) ) {
            console.log('Add spring:  coords');
            isValid = false;
        }
        console.log('creds:', name.length, longitude.length, latitude.length, tooltip, author)


        isValid ?
            axios.post(
                URL_LOCATIONS,
                payload,
                header
            )
            .then(function (response) {

                console.log('response', response.data);
                console.log('The SPRING is added....')
                setTimeout(() => {
                    updateData();
                }, 1000);
            })
            .catch(function (error) {
                console.log('Something Wrong...');
                console.log(error);
            })
            : null;

        return 0;
    });
});

const updateData = async () => {
    // Get list of springs
    try {
        springs = await getSprings()
        // event for updateView
        document.dispatchEvent(updateEvent)
    } catch (error) {
        throw new Error(`Unable to get springs`, error);
    }

    console.log('updateData')
}

const getSprings = async (currencyCode) => {
    console.log('getSprings')
    try {
        const response = await axios.get(URL_LOCATIONS);

        return response.data
    } catch (error) {
        throw new Error('axios cant get locations', error);
    }
};

const updateView = () => {
    console.log('updateView')
    /**
     * @param {string} springsTable - html table
     */
    let springsTable = `
        <table class="pure-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Название</th>
                    <th>Долгота</th>
                    <th>Широта</th>
                    <th>Краткое описание</th>
                </tr>
            </thead>
            <tbody>`

    /**
     * @param {Object} el
     * @param {number} el.id
     * @param {string} el.name
     * @param {string} el.longitude
     * @param {string} el.latitude
     * @param {string} el.tooltip
     */
    springs.forEach((el) => {

        let {id,name,longitude,latitude,tooltip} = el;
        let html =''

        html += `<tr>
                <td>${id}</td>
                <td>${name}</td>
                <td>${longitude}</td>
                <td>${latitude}</td>
                <td>${tooltip}</td>
                <td data-id="${id}" class="delete-x">X</td>
                </tr>`
        springsTable += html
    });

    springsTable += `</tbody></table>`

    $('#springs-list').html(springsTable)

    // Delete spring
    $(".delete-x").click(function (e) {
        let id = $(this).attr('data-id');
        try {
            axios.delete(URL_LOCATIONS + '/:' + id)
            updateData();
        } catch (error) {
            throw new Error('axios cant get locations', error);
        }
    });
}