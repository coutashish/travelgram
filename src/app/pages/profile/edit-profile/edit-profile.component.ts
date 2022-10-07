import { Component, OnInit, OnChanges } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { doc, deleteDoc } from "firebase/firestore";
import {
  getAuth,
  deleteUser,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { NgForm } from '@angular/forms';
import { readAndCompressImage } from 'browser-image-resizer';
import { finalize } from 'rxjs';
import { imageConfig } from 'src/utils/config';
import { percentage } from '@angular/fire/storage';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit, OnChanges {
  user: any  = null;
  object: any = null;
  password: any = null;
  id: any = null;
  name: any = null;
  email: any = null;
  instaUserName: any = null;
  country: any = null;
  bio: any = null;
  picture: any = null;
  uploadPercent: number | null = null;
  isLoading = false;
  constructor(
    private auth: AuthService,

    private db: AngularFireDatabase,
    private toastr: ToastrService,
    private router: Router,
    private storage: AngularFireStorage
  ) {
    this.isLoading = true;
    auth.getUser().subscribe((user:any) => {
      // console.log("user is", user);
      this.db.object(`/users/${user.uid}`)
              .valueChanges()
              .subscribe(
                (user:any)=>{
                  this.user = user;
                }
              )
      this.email = user?.email;
      db.object('/users')
        .valueChanges()
        .subscribe((obj: any) => {
          this.object = Object.values(obj);
          this.object.map((user: any) => {
            if (user.email == this.email) {
              this.id = user.id;
              this.name = user.name;
              this.instaUserName = user.instaUserName;
              this.country = user.country;
              this.picture = user.picture;
              this.bio = user.bio;
            }
          });
        });
    });
  }
  ngOnInit(): void {}
  ngOnChanges(): void {}
  onSubmit(f: NgForm) {
    // destructuring email and password
    let { name, email, username, country, bio } = f.form.value;
    if (!name) name = this.name;
    if (!email) email = this.email;
    if (!username) username = this.instaUserName;
    if (!country) country = this.country;
    if (!bio) bio = this.bio;

    // creating one user in DB
    this.db
      .object(`/users/${this.id}`)
      .update({
        //id: this.id,
        name: name,
        email: email,
        instaUserName: username,
        country: country,
        bio: bio,
        picture: this.picture,
      })
      .then(() => {
        // as soon as saved in DB then redirecting to home
        this.router.navigateByUrl('/profile');
        this.toastr.success('updated');
      })
      .catch((err) => {
        // to show some error occuried

        this.toastr.error('Something wents wrong');
      });
  }
  onDelete() {
    const auth = getAuth();
    const user: any | null = auth.currentUser;
    const password: any = prompt('Enter Your Password');
    const email = this.email;
    this.auth
      .signIn(email, password)
      .then(() => {
        deleteUser(user)
          .then(async () => {
            // User deleted.
            this.db.object(`/users/${this.id}`)
            .remove().then(
              ()=>{
                this.toastr.success("user data removed")
              }
            )
            .catch(
              (err)=>{
                this.toastr.error('data remove nahi hua ')
              }
            )
            this.toastr.success('deleted Success');
            this.router.navigateByUrl('/signin');

          })
          .catch((error) => {
            this.toastr.error('not able to delete');
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async uploadFile(event: any) {
    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file, imageConfig);

    const filePath = file.name; // rename with uuid :- Task
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage: any) => {
      this.uploadPercent = percentage;
    });
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('image upload ho gayi ha');
          });
        })
      )
      .subscribe();
  }
}
function promptForCredentials() {
  throw new Error('Function not implemented.');
}
