import { Component } from '@angular/core';

// import { NavController } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';

@Component({
  templateUrl: 'new-assignment.html'
})
export class NewAssignmentPage {
   members = [
     {
      name:'Sean Goodwin'
     },
     {
      name:'Sean Goodwin2'
     },
     {
      name:'Sean Goodwin3'
     },
     {
      name:'Sean Goodwin4'
     }
   ];
   councils = ['Bishopric','Bishopric2','Bishopric3'   ];

  //  assignment = {
  //    description:'',
  //    assignTo:'',
  //    council:'',
  //    date:'',
  //    time:''
  //  }
  cancel(){

  }
  createAssignment(){

  }
}
