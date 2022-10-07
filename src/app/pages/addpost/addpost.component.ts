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
import { v4 as uuidv4 } from "uuid";
@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css']
})
export class AddpostComponent implements OnInit {

  locationName: string | undefined ;
  description: string | undefined;
  picture: string | null = null;
  user: any  = null;
  uploadPercent: any = null;

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private auth: AuthService,
    private router:Router
  ) {
    auth.getUser().subscribe((user:any)=>{
      this.db.object(`/users/${user.uid}`)
              .valueChanges()
              .subscribe(
                (user:any)=>{
                  this.user = user;
                  
                  
                }
              )
    })
   }

  ngOnInit(): void {
  }

  onSubmit(){
    const uid = uuidv4() 



    this.db.object(`/posts/${uid}`)
            .set({
              id:uid,
              locationName : this.locationName,
              description:this.description,
              picture:this.picture,
              by:this.user.name,
              byId:this.user.id,
              instaId:this.user.instaUserName,
              date:Date.now()
            })
            .then(
              ()=>{
                this.toastr.success("Post Added")
                this.router.navigateByUrl("/")
              }
            )
            .catch(
              (err)=>{
                this.toastr.error('yeh error on submits aya ha ')
              }
            )

  }

  async uploadFile(event:any){
    const file = event.target.files[0];
    let resizedImage = await readAndCompressImage(file,imageConfig);
    const filePath = file.name;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath,resizedImage)

     // observe percentage changes
      task.percentageChanges().subscribe((percent:any) => {
        
        

      this.uploadPercent = percent;
    });
   // console.log("% yaha ayega:",this.uploadPercent);

    // get notified when the download URL is available
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            // update complete
            this.picture = url;
            this.toastr.info('Image uploaded successfully');
          });
        })
      )
      .subscribe();
  }
}
