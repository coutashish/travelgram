import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // to hold users which are fetched from the firebase DB
  users:any = [];
  // to hold post which are fetched from the firebase DB
  posts:any = [];

  // to show/hide spinner
  isLoading = false;

  constructor(db: AngularFireDatabase, private toastr: ToastrService) {
    // showing spinner to UI
    this.isLoading = true;

    // fetch users
    db.object('/users')
      .valueChanges()
      .subscribe((obj:any) => {
      //  console.log("Yaha object a raha ha",obj);

        // fetching users as object. If no users is there then its null.
        // taking the values out from the users object and setting in the array
        if (obj) {
          this.users = Object.values(obj);
          
          
          // setting loading to false
          this.isLoading = false;
        } else {
          // if their is no users.
          toastr.error('NO users found');
          this.users = [];
          this.isLoading = false;
        }
      });

    // fetching all posts
    db.object('/posts')
      .valueChanges()
      .subscribe((obj:any) => {
        // fetching contacts as object. If no contact is there then its null.
        // taking the values out from the contact object and setting in the array
        if (obj) {
          this.posts = Object.values(obj).sort((a:any, b:any) => b.date - a.date);

          console.log(this.posts);

          this.isLoading = false;
        } else {
          // if their is no users.
          toastr.error('NO posts found');
          this.posts = [];
          this.isLoading = false;
        }
      });
  }
  ngOnInit(): void {}
}