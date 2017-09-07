'use strict';
class User {
    constructor( id, firstName, lastName, groups ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.groups = groups;
    }

    get fullName() {
        return this.firstName + ' ' + this.lastName;
    }
}