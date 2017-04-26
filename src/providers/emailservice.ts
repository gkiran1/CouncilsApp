import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()

export class EmailService {
    constructor(public http: Http) {
        
    }
    mailApiUrl = 'https://councilsapi-165009.appspot.com/sendmail';
    
    //Email to invite member
    inviteMemberEmail(firstname, unitnum, email) {
        
        return this.http.post(this.mailApiUrl, { 
           "event":"invite", "email": email, "firstname": firstname, "unitnum": unitnum, 
        });
        
    }

    //Email to create account
    emailCreateAccount(firstname, lastname, unitnum, email) {
        return this.http.post(this.mailApiUrl, { 
           "event":"accountcreated", "email": email, "firstname": firstname, "unitnum": unitnum, "lastname":lastname
        });
    }


    //Email to create account
    emailForgotPassword(email) {
        return this.http.post(this.mailApiUrl, { 
           "event":"forgotpassword", "email": email, "firstname": "Councils User"
        });
    }


    //Email to create account
    emailAccountInactive(firstname, lastname, email) {
        return this.http.post(this.mailApiUrl, { 
           "event":"inactivated", "email": email, "firstname": firstname, "lastname":lastname
        });
    }


    //Email to create account
    emailReactivate(firstname, lastname, unitnum, email) {
        return this.http.post(this.mailApiUrl, { 
           "event":"reactivated", "email": email, "firstname": firstname, "unitnum": unitnum, "lastname":lastname
        });
    }

    //Email to create account
    emailTrasferAdmin(firstname, lastname, unitnum, email, adminfirstname, adminlastname) {
        return this.http.post(this.mailApiUrl, { 
           "event":"admintransfer", "email": email, "firstname": firstname, "unitnum": unitnum, "lastname":lastname,
           "adminfirstname":adminfirstname, "adminlastname": adminlastname
        });
    }

    //Email to create account
    emailAdminCreated(firstname, lastname, unitnum, email) {
        return this.http.post(this.mailApiUrl, { 
           "event":"admincreated", "email": email, "firstname": firstname, "unitnum": unitnum, "lastname":lastname
        });
    }

}
