import { Component, OnInit, ɵɵsetComponentScope } from '@angular/core';
import {
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
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

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new UntypedFormGroup({
    title: this.title,
  });

  constructor(private storage: AngularFireStorage) {}

  ngOnInit(): void {}

  storeFile($event: Event) {
    this.isDragover = false;
    // console.log($event)
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null;

    // mime type validation
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    // console.log(this.file);
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Your clip is being uploaded.';
    this.inSubmission = true;
    this.showPercentage = true;

    // generate the unique filename and its path
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    // upload the file
    const task = this.storage.upload(clipPath, this.file);
    task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });
    // check for upload state, using the last observable pushed
    task
      .snapshotChanges()
      .pipe(last())
      .subscribe({
        next: (snapshot) => {
          this.alertColor = 'green';
          this.alertMsg = 'Success! Your clip has now been uploaded.';
          this.showPercentage = false;
        },
        error: (error) => {
          this.alertColor = 'red';
          this.alertMsg = 'Upload Failed! Please try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
          console.error(error);
        },
      });
  }
}
