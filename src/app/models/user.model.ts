
export class User {
    userType: any;
    userId: any;
    name: any;
    admin: any;

    constructor(response: any) {
        this.userType = response.user_type;
        this.userId = response.user_id;
        this.name = response.name;
        this.admin = response.admin_p;
    }

    public isAdmin() {
        return this.admin;
    }

}
