import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';
import IClip from 'src/app/models/clip.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  constructor(private modal: ModalService, private clipService: ClipService) {}

  @Input() activeClip: IClip | null = null;
  inSubmission = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Updating Clip.';
  @Output() update = new EventEmitter();

  clipID = new FormControl('', {
    nonNullable: true,
  });
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  editForm = new UntypedFormGroup({
    title: this.title,
    id: this.clipID,
  });

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }

  // update forms when the active clip is changed
  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }

    this.inSubmission = false;
    this.showAlert = false;
    this.clipID.setValue(this.activeClip.docID as string);
    this.title.setValue(this.activeClip.title);
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }

    // update the properties for the alert box and form
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Updating Clip.';

    // send data to firebase
    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch (e) {
      console.error(e);
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong. Try again later.';
      return;
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);

    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!';
  }
}
