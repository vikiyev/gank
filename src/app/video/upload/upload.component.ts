import { Component, OnDestroy } from '@angular/core';
import {
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnDestroy {
  isDragover = false;
  file: File | null = null;
  // hide the form until file is uploaded
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Your clip is being uploaded.';
  inSubmission = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new UntypedFormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
  }

  ngOnDestroy(): void {
    // cancel the upload upon destruction
    this.task?.cancel();
  }

  storeFile($event: Event) {
    this.isDragover = false;
    // console.log($event)

    // check for drag and drop, otherwise use input fallback
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    // mime type validation
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    // console.log(this.file);
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.uploadForm.disable();

    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Your clip is being uploaded.';
    this.inSubmission = true;
    this.showPercentage = true;

    // generate the unique filename and its path
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    // upload the file
    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });
    // check for upload state, using the last observable pushed
    this.task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: async (url) => {
          // clip information
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipsService.createClip(clip);

          this.alertColor = 'green';
          this.alertMsg = 'Success! Your clip has now been uploaded.';
          this.showPercentage = false;

          // redirect the user to the clip using the firestore id
          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 2000);
        },
        error: (error) => {
          this.uploadForm.enable();

          this.alertColor = 'red';
          this.alertMsg = 'Upload Failed! Please try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
          console.error(error);
        },
      });
  }
}
