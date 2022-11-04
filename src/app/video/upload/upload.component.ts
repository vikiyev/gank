import { Component, OnInit, ɵɵsetComponentScope } from '@angular/core';
import {
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

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

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new UntypedFormGroup({
    title: this.title,
  });

  constructor() {}

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
    console.log('File uploaded');
  }
}
