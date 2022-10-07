import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  object:any;
  email:any = null;
  name:any = null;
  picture: any = 
    'https://firebasestorage.googleapis.com/v0/b/kirana-f08b6.appspot.com/o/img.png?alt=media&token=1857e7db-06df-4e77-9756-60aa018e1460';
  
 
  constructor(
    private auth:AuthService,
    private router:Router,
    private toastr:ToastrService,
    private db:AngularFireDatabase
  ) {
    auth.getUser().subscribe((user)=>{
      console.log("user is", user);
      this.email = user?.email;
    })


    db.object('/users')
      .valueChanges()
      .subscribe(
        (obj:any)=>{
          this.object = Object.values(obj);
      
          this.object.map(
            (arrVal:any)=>{
           
              if(arrVal.email == this.email){
             
                this.name = arrVal.name;
                this.picture = arrVal.picture;
              }
            }
          )
          
        }
      )
    
   }

  ngOnInit(): void {

  }

  async handleSignOut(){
    try {
      await this.auth.signOut();
      this.router.navigateByUrl('/signin');
      this.toastr.info("Logout ho gaya ");
      this.email =null;
    } catch (error) {
      this.toastr.error("problem in SignOut")
    }
  }

}

