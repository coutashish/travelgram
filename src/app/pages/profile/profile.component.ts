import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  isAdmin:any = false;
  object:any=null;
  objectTwo:any=null;
  id:any=null;
  name: any=null
  email: any=null;
  instaUserName:any=null;
  country: any=null;
  bio: any=null;
  picture:any=null;
  posts:any = [];
  isLoading = false;
  constructor(
    private auth:AuthService,
    private db:AngularFireDatabase,
    private toastr: ToastrService
  ) {
    // ______________________constructer_______________________
    this.isLoading = true;
    auth.getUser().subscribe((user)=>{
      console.log("user is", user);
      this.email = user?.email;
      db.object('/users').valueChanges().subscribe(
        (obj:any)=>{
          this.object = Object.values(obj);
          this.object.map(
            (user:any)=>{
              if(user.email == this.email){
                this.id = user.id;
                this.name = user.name;
                this.instaUserName = user.instaUserName;
                this.country = user.country;
                this.picture = user.picture;
                this.bio = user.bio;
              }
            }
          )
        }
      )
      db.object('/posts').valueChanges().subscribe(
        (obj:any) => {
        // fetching contacts as object. If no contact is there then its null.
        // taking the values out from the contact object and setting in the array
       
        if (obj) {
          this.objectTwo = Object.values(obj)
        let newObj:any = obj;
          this.objectTwo.map(
            (post:any,index:any)=>{
              
             
              if(post.byId!==this.id){

               
                // newObj = Object.values({post});
                 delete newObj[post.id]
                
                }
            }
          )
        
         
          this.posts = Object.values(newObj)
                .sort((a:any, b:any) => b.by - a.date);
         
          //console.log(this.posts);

          this.isLoading = false;
        } else {
          // if their is no users.
          toastr.error('NO posts found');
          this.posts = [];
          this.isLoading = false;
        }
      });
    })
    // ______________________constructer_______________________
   }

  ngOnInit(): void {
  }

}
