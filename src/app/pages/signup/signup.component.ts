import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { finalize } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { readAndCompressImage } from 'browser-image-resizer';
import { NgForm } from '@angular/forms';
import { imageConfig } from 'src/utils/config';
import { percentage } from '@angular/fire/storage';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  picture: string = 
    'https://firebasestorage.googleapis.com/v0/b/kirana-f08b6.appspot.com/o/img.png?alt=media&token=1857e7db-06df-4e77-9756-60aa018e1460';
  uploadPercent: number | null = null;
  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}
  onSubmit(f: NgForm) {
    // destructuring email and password
    const { email, password, username, country, bio, name } = f.form.value;

    this.auth
      .signUp(email, password)
      .then((res) => {
        // as soon as the signup is completed we are creating one user in firebase Realtime DB to store its details
       // console.log("thisssss is responsee",res);
        // using his uid to create unique one
       // const { uid  } = res.user;
        const uid = res.user?.uid;

        // creating one user in DB
        this.db
          .object(`/users/${uid}`)
          .set({
            id: uid,
            name: name,
            email: email,
            instaUserName: username,
            country: country,
            bio: bio,
            picture: this.picture,
          })
          .then(() => {
            // as soon as saved in DB then redirecting to home
            this.router.navigateByUrl('/');
            this.toastr.success('Auth complete');
          })
          .catch((err) => {
            // to show some error occuried
            
            
            this.toastr.error('Something wents wrong');
          });
      })
      .catch((err) => {
        // signup catch block
        console.error(err.message);
        this.toastr.error(err.message);
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
    task.snapshotChanges().pipe(
      
                                  finalize(
                                    () => {
                                     
                                      fileRef.getDownloadURL()
                                             .subscribe(
                                                      (url) => {
                                                        
                                                        
                                                                this.picture = url;
                                                                this.toastr.success('image upload ho gayi ha');
                                                              }
                                                    );
                                    }
                                  )
                                )
                          .subscribe();
  }
}
