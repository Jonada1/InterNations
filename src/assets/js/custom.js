(function ($) {
    'use strict';

    let Users = localStorage.getItem('taskUsers') !== null ? JSON.parse(localStorage.getItem('taskUsers')) : [];
    let Groups = localStorage.getItem('taskGroups') !== null ? JSON.parse(localStorage.getItem('taskGroups')) : [];
    let $usersWrapper = $('.users-list');
    let $groupsWrapper = $('.groups-list');
    let $createUserWrapper = $('.user-creator');
    let $createGroupWrapper = $('.group-creator');

    // function to generate id's
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4();
        //  + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    // generate list of users
    function generateUsersList() {
        $usersWrapper.find('ul.list-group').html('');
        if (!Users.length) {
            $usersWrapper.find('ul.list-group').append(`<li class="list-group-item">No users found</li>`);
            return false;
        }
        let template = ``;
        Users.forEach(user => {
            template += `<li class="list-group-item" data-user-id="${user.id}">
            ${user.firstName} ${user.lastName} 
            <div class="list-actions">
                <button class="btn btn-danger" data-action="delete">Delete</button>
                <button class="btn btn-info" data-action="edit">Edit</button> 
            </div>
</li>`;

    });
        $usersWrapper.find('ul.list-group').append(template);
    }

    // add single user to list and localStorage
    function addUser(user) {
        if (Users.length === 1) {
            $usersWrapper.find('ul.list-group').html('');
        }
        $usersWrapper.find('ul.list-group').append(
            `<li class="list-group-item" data-user-id="${user.id}">
            ${user.fullName}
            <div class="list-actions">
                <button class="btn btn-danger" data-action="delete">Delete</button>
                <button class="btn btn-info" data-action="edit">Edit</button>
            </div>
            </li>`
        );
        if (localStorage.getItem('taskUsers') !== null) {
            let users = JSON.parse(localStorage.getItem('taskUsers'));
            users.push(user);
            localStorage.setItem('taskUsers', JSON.stringify(users));
        } else {
            localStorage.setItem('taskUsers', JSON.stringify([user]));
        }
    }

    // generate list of groups
    function generateGroupsList() {
        $groupsWrapper.find('ul.list-group').html('');
        if (!Groups.length) {
            $groupsWrapper.find('ul.list-group').append(`<li class="list-group-item">No groups found</li>`);
            return false;
        }
        let template = ``;
        Groups.forEach(group => {
            template += `<li class="list-group-item" data-group-id="${group.id}">
            ${group.groupName}
                <div class="list-actions">
                    <button class="btn btn-danger" data-action="delete">Delete</button>
                    <button class="btn btn-info"  data-action="edit">Edit</button>
                </div>
            </li>`
    });
        $groupsWrapper.find('ul.list-group').append(template);
    }

    // add single group to list 
    function addGroup(group) {
        if (!Groups.length) {
            $groupsWrapper.find('ul.list-group').html('');
        }
        $groupsWrapper.find('ul.list-group').append(
            `<li class="list-group-item" data-group-id="${group.id}">
           ${group.groupName}
            <div class="list-actions">
                <button class="btn btn-danger" data-action="delete">Delete</button>
                <button class="btn btn-info" data-action="edit" data-toggle="modal" data-target="#editModal">Edit</button>
            </div>
            </li>`
        );
        if (localStorage.getItem('taskGroups') !== null) {
            let groups = JSON.parse(localStorage.getItem('taskGroups')) || [];
            groups.push(group);
            localStorage.setItem('taskGroups', JSON.stringify(groups));
        } else {
            localStorage.setItem('taskGroups', JSON.stringify([group]));
        }
    }

    // handle group actions
    function groupActions() {
        // delete action
        $groupsWrapper.on('click', '[data-action="delete"]', function () {
            let grId = $(this).closest('li').data('group-id');
            let groups = JSON.parse(localStorage.getItem('taskGroups'));
            let users = JSON.parse(localStorage.getItem('taskUsers')) || [];
            if (!!users.find(user => { return user.groups.includes(grId.toString()) })) {
                alert('This group has users and can\'t be deleted');
                return false;
            }
            groups.forEach((group, index) => {
                if (group.id === grId.toString()) {
                groups.splice(index, 1);
                return false;
            }
        });
            localStorage.setItem('taskGroups', JSON.stringify(groups));
            $(this).closest('li').fadeOut(function () {
                $(this).remove();
            })
        });

        //  edit action
        $groupsWrapper.find('[data-action="edit"]').on('click', function () {
            // Do something with edit
            let grId = $(this).closest('li').data('group-id');
            let groups = JSON.parse(localStorage.getItem('taskGroups'));
            groups.forEach((group, index) => {
                if (group.id === grId) {

                groups.splice(index, 1);
                localStorage.setItem('taskGroups', JSON.stringify(groups));
                return false;
            }
        })
        });
    }

    // handle users actions
    function userActions() {
        // delete action
        $usersWrapper.on('click', '[data-action="delete"]', function () {
            console.log('click')
            let userId = $(this).closest('li').data('user-id');
            let users = JSON.parse(localStorage.getItem('taskUsers'));
            users.forEach((user, index) => {
                if (user.id === userId.toString()) {
                users.splice(index, 1);
                return false;
            }
        });
            localStorage.setItem('taskUsers', JSON.stringify(users));
            $(this).closest('li').fadeOut(function () {
                $(this).remove();
            })
        });
    }

    // create user
    function handleUserCreation() {
        let $form = $createUserWrapper.find('form');
        let $groupsEl = $form.find('#groups');
        // init selectize lib for groups
        $groupsEl.selectize({
            plugins: ['remove_button'],
            preload: false,
            valueField: 'id',
            labelField: 'groupName',
            searchField: ['groupName'],
            sortField: 'id',
            selectOnTab: true,
            options: Groups,
            create: false,
            closeAfterSelect: true,
            onChange: function (value) {
                this.close();
                this.blur();
            }
        });
        // form validation
        $.validator.addMethod("checkUserFullName", function (value, element, regexp) {
                let re = new RegExp(regexp);
                return this.optional(element) || re.test(value);
            },
            "Only characters are allowed."
        );
        $.validator.addMethod("user_email", function (value, element) {
            let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            let reg = '+';
            let newVal = value.split('@');
            return this.optional(element) || (re.test(value) && (newVal[0].indexOf(reg) < 0));
        }, "Please enter a valid email address.");
        $form.validate({
                ignore: ':hidden:not([class~=selectized]),:hidden > .selectized, .selectize-control .selectize-input input',
                focusInvalid: false,
                errorPlacement: (error, element) => {
                error.appendTo(element.parent().after());
    },
        onfocusout: (element) => {
            if ($(element).valid()) {
                if ($(element).parent().hasClass('selectize-input')) {
                    $(element).parent().parent().next('label.error').remove();
                }
            }
        },
        highlight: (element) => {
            if ($(element).hasClass('selectized')) {
                $(element).siblings('.selectize-control').find('.selectize-input').addClass('isnotvalid');
            } else {
                $(element).addClass('isnotvalid');
            }
        },
        unhighlight: (element) => {
            $(element).removeClass('isnotvalid');
            $(element).parent().removeClass('isnotvalid');
        },
        rules: {
            'first-name': {
                required: true,
                    checkUserFullName: "^[a-zA-Z' ]+$"
            },
            'last-name': {
                required: true,
                    checkUserFullName: "^[a-zA-Z' ]+$"
            },
            'email': {
                required: true,
                    user_email: true
            },
            'groups': {
                required: true
            }
        }
    });

        // detect form submit and simulate a real life example
        $form.on('submit', function (e) {
            e.preventDefault();
            if ($(this).valid()) {
                let firstName = $form.find('#first-name').val();
                let lastName = $form.find('#last-name').val();
                let email = $form.find('#email').val();
                let groups = $form.find('#groups').val().split(',');
                let user = new User(guid(), firstName, lastName, groups);
                Users.push(user);
                // add user to list without reloading the page
                addUser(user);

                // reset the form
                $form.get(0).reset();
                $form.find('#groups').get(0).selectize.clear();
            }
        });
    }

    // create group
    function handleGroupCreation() {
        let $form = $createGroupWrapper.find('form');
        $form.validate({
                focusInvalid: false,
                errorPlacement: (error, element) => {
                error.appendTo(element.parent().after());
    },
        onfocusout: (element) => {
            if ($(element).valid()) {
                if ($(element).parent().hasClass('selectize-input')) {
                    $(element).parent().parent().next('label.error').remove();
                }
            }
        },
        highlight: (element) => {
            if ($(element).hasClass('selectized')) {
                $(element).siblings('.selectize-control').find('.selectize-input').addClass('isnotvalid');
            } else {
                $(element).addClass('isnotvalid');
            }
        },
        unhighlight: (element) => {
            $(element).removeClass('isnotvalid');
            $(element).parent().removeClass('isnotvalid');
        },
        rules: {
            'group-name': {
                required: true,
            }
        }
    });

        // detect form submit and simulate a real life example
        $form.on('submit', function (e) {
            e.preventDefault();
            if ($(this).valid()) {
                let groupName = $form.find('#group-name').val();
                let group = new Group(guid(), groupName);

                // add group to list and localStorage 
                addGroup(group);
                $form.find('#group-name').val('');
            }
        });
    }

    $(document).ready(function () {

        /**
         *  Generate the list of saved users
         */
        generateUsersList();

        /**
         *  Handle user item actions
         */
        userActions();

        /**
         *  Generate the list of saved groups
         */
        generateGroupsList();

        /**
         *  Handle group item actions
         */
        groupActions();

        /**
         *  Handle Create user form ( including validation )
         */
        handleUserCreation();

        /**
         *  Handle Create group ( including validation )
         */
        handleGroupCreation();

    });
})(jQuery)