import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Injectable } from '@angular/core';
import {
  AsyncValidator,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {}

  validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
    // firebase will return an empty array if the email does not exist
    return this.auth
      .fetchSignInMethodsForEmail(control.value)
      .then((response) => (response.length ? { emailTaken: true } : null));
  };
}
