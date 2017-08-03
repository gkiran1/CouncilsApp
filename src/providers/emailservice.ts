import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FirebaseService } from '../environments/firebase/firebase-service';

@Injectable()

export class EmailService {
    userId;

    constructor(public http: Http, public firebaseService: FirebaseService) {
        this.userId = localStorage.getItem('securityToken');
    }

    mailApiUrl = 'https://councilsapi-165009.appspot.com/v1/sendmail';

    //Email to invite member
    inviteMemberEmail(name, unitnum, email, adminname) {
        return this.firebaseService.getFirebaseAuthTkn().then(tkn => {
            let headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': tkn, 'x-key': this.userId });
            let options = new RequestOptions({ headers: headers });

            return this.http.post(this.mailApiUrl, {
                "event": "invite", "email": email, "name": name, "unitnum": unitnum, "adminname": adminname
            }, options);
        });
    }

    //Email to invite admin
    inviteAdminEmail(name, email, adminname) {
        return this.firebaseService.getFirebaseAuthTkn().then(tkn => {
            let headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': tkn, 'x-key': this.userId });
            let options = new RequestOptions({ headers: headers });

            return this.http.post(this.mailApiUrl, {
                "event": "invite", "email": email, "name": name, "adminname": adminname
            }, options);
        });
    }

    //Email to create account
    emailCreateAccount(firstname, lastname, unitnum, email, fbAuthToken, uid) {
        let headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': fbAuthToken, 'x-key': uid });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(this.mailApiUrl, {
            "event": "accountcreated", "email": email, "firstname": firstname, "unitnum": unitnum, "lastname": lastname
        }, options);
    }

    //Email to create account
    emailForgotPassword(email) {
        return this.http.post(this.mailApiUrl, {
            "event": "forgotpassword", "email": email, "name": 'Councils user'
        });
    }

    //Email to create account
    emailAccountInactive(name, email, adminname) {
        return this.firebaseService.getFirebaseAuthTkn().then(tkn => {
            let headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': tkn, 'x-key': this.userId });
            let options = new RequestOptions({ headers: headers });

            return this.http.post(this.mailApiUrl, {
                "event": "inactivated", "email": email, "name": name, "adminname": adminname
            }, options);
        });
    }

    //Email to create account
    emailReactivate(name, unitnum, email, adminname) {
        return this.firebaseService.getFirebaseAuthTkn().then(tkn => {
            let headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': tkn, 'x-key': this.userId });
            let options = new RequestOptions({ headers: headers });

            return this.http.post(this.mailApiUrl, {
                "event": "reactivated", "email": email, "name": name, "unitnum": unitnum, "adminname": adminname
            }, options);
        });
    }

    //Email to create account
    emailTrasferAdmin(firstname, lastname, unitnum, email, adminfirstname, adminlastname) {
        return this.firebaseService.getFirebaseAuthTkn().then(tkn => {
            let headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': tkn, 'x-key': this.userId });
            let options = new RequestOptions({ headers: headers });

            return this.http.post(this.mailApiUrl, {
                "event": "admintransfer", "email": email, "firstname": firstname, "unitnum": unitnum, "lastname": lastname,
                "adminfirstname": adminfirstname, "adminlastname": adminlastname
            }, options);
        });
    }

    //Email to create account
    emailAdminCreated(firstname, lastname, unitnum, email) {
        return this.http.post(this.mailApiUrl, {
            "event": "admincreated", "email": email, "firstname": firstname, "unitnum": unitnum, "lastname": lastname
        });
    }

}
