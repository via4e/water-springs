let springs = [];
let uploadImg = null;
let uploadImgFilename = '';

const URL_LOCATIONS = conf.server_domain + ':' + conf.server_port + '/' + conf.server_locations_path;
const URL_UPLOAD = conf.server_domain + ':' + conf.server_port + '/' + 'upload';
const updateEvent = new Event('update')
const regexp = /-?\d{1,3}\.\d+/

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
        console.log(t)
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

    //test feature, fill on Enter
    $( "#tab2C" ).on( "keyup", function() {
        if ( event.which == 13 ) {
            event.preventDefault();
            $('input#name').val('New Spring')
            $('input#latitude').val('56.838002')
            $('input#longitude').val('60.597295')
            $('input#tooltip').val('Description')
            $('input#author').val('New Spring')
        }
    } );

    $("#new-form").on("submit", function (e) {
        e.preventDefault();
        let isValid = true;
        let id = (localStorage.getItem('spring_id'))*1;

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
            author: localStorage.getItem('username') || '',
            main_image: uploadImgFilename || ''
        }

        if (name.length === 0 || longitude.length === 0 || latitude.length === 0) {
            console.log('Add spring: Empty Data');
            isValid = false;
        }

        if ( !regexp.test(latitude) || !regexp.test(longitude) ) {
            console.log('Add spring:  coords');
            isValid = false;
        }
        console.log('creds:', payload, 'valid:', isValid)

        // Если есть картинка, отправляем её
        if(payload.main_image && isValid) {
            console.warn('try to upload image...')
            axios.post(
                URL_UPLOAD,
                uploadImg,
                header
            ).then(function (response) {
                console.log('response', response.data);
                console.log(`The PIC  ${uploadImgFilename} is added....`)
                setTimeout(() => {
                    updateData();
                }, 1000);
            }).catch(function (error) {
                console.log('Something Wrong...');
                console.log(error);
            })
        }


        // new spring - POST
        if (isValid & !id) {
            console.warn('try to write NEW spring...')
            axios.post(
                URL_LOCATIONS,
                payload,
                header
            ).then(function (response) {
                console.log('response', response.data);
                console.log(`The SPRING  ${id} is added....`)

                setTimeout(() => {
                    updateData();
                }, 1000);
            }).catch(function (error) {
                console.log('Something Wrong...');
                console.log(error);
            })
        }

        // we have id for PATCH old spring
        if (isValid & id) {
            console.warn('try to PATCH spring...')
            axios.patch(
                URL_LOCATIONS + '/:' + id,
                payload,
                header
            ).then(function (response) {
                console.log('response', response.data);
                console.log(`The SPRING  ${id} is updated....`)
                setTimeout(() => {
                    updateData();
                }, 1000);
            }).catch(function (error) {
                console.log('Something Wrong...');
                console.log(error);
            })
        }

        //clear
        localStorage.setItem('spring_id', 0);

        return 0;
    });

    //image upload prepare
    $('#fileUpload').on('change', function () {

        let file = this.files[0];
        let reader = new FileReader();
        let image = $('#choosed-image')

        reader.readAsDataURL(file);

        reader.onload = function () {
            uploadImg = reader.result;  // data <-- in this var you have the file data in Base64 format
            image.attr('src', uploadImg)

            uploadImgFilename = Date.now() + '_' + file.name
            console.log('event: Change! New file name:', uploadImgFilename)
        };

        reader.onerror = function() {
            console.log(reader.error);
        };
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
                    <td data-id="${id}" class="js-spring-edit">
                        <span class="icon-edit"></span>
                    </td>
                    <td data-id="${id}" class="delete-x">X</td>
                </tr>`
        springsTable += html
    });

    springsTable += `</tbody></table>`

    $('#springs-list').html(springsTable)

    // Delete spring diag
    $(".delete-x").click(function (e) {
        e.preventDefault();

        let id = Number( $(this).attr('data-id') );

        if(id) {
            localStorage.setItem('spring_id', id);
            console.log('spring_id', typeof id)
            const spring = springs.find(spring => spring.id === id)
            console.log('spr', spring)

            $('.modal-delete__text').text(`Вы действительно хотите удалить родник ${spring.id} ${spring.name}?`);
            $('#modal-bg').show()
        } else {
            throw new Error('Spring id is invalid:', id);
        }
    });

    $(".js-delete-ok").click(function (e) {
        let id = localStorage.getItem('spring_id') || 0;
        if(!id) return;
        try {
            axios.delete(URL_LOCATIONS + '/:' + id).then(function (response) {
                console.warn(response.data.message);
                $('#modal-bg').hide()
                //clear deleted spring
                localStorage.setItem('spring_id', 0);
                updateData();
            })

        } catch (error) {
            throw new Error('axios cant get locations', error);
        }
    });

    $(".js-delete-cancel").click(function (e) {
        //clear current spring
        localStorage.setItem('spring_id', 0);
        $('#modal-bg').hide()
    });

    // Edit spring
    $(".js-spring-edit").click(function (e) {
        e.preventDefault();
        let id = Number($(this).attr('data-id'));
        localStorage.setItem('spring_id', id);
        let currentSpring = springs.find((e) => e.id === id)

        console.log('id', currentSpring)
        //Set inputs
        $('#name').val(currentSpring.name)
        $('#latitude').val(currentSpring.latitude)
        $('#longitude').val(currentSpring.longitude)
        $('#tooltip').val(currentSpring.tooltip)
        $('#author').val(currentSpring.author)

        $('.tab').hide();
        $('#tab1').addClass('inactive');
        $('#tab3').addClass('inactive');
        $('#tab2C').fadeIn('slow');
    });
}