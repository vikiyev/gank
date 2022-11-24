# Gank

Built with Angular, following ZTM's online [course](https://www.udemy.com/course/complete-angular-developer-zero-to-mastery/).

This is an application for gamers to upload and share their clips. Users have an option to login and register to the app. The backend uses Firebase and integrates through AngularFire. The app uses webassembly to process video files for extracting a screenshot.

Check out the live app at [https://ng-gank.vercel.app/](https://ng-gank.vercel.app/) and feel free to register and upload your gaming highlights!

**Features:**

- Form Validation
- Stateless authentication with Firebase
- Integration with Firestore database
- Video playback and screenshot generation with FFmpeg
- Routing
- Lazy Loading
- Infinite Scrolling
- Reusable Modal Component

- [Gank](#gank)
  - [Tailwind Installation](#tailwind-installation)
  - [Creating the User Module](#creating-the-user-module)
  - [Content Projection](#content-projection)
    - [Multi Slot Content Projection](#multi-slot-content-projection)
  - [Services](#services)
    - [Dependency Injection](#dependency-injection)
    - [Modal Visibility](#modal-visibility)
  - [Singleton](#singleton)
  - [Forms](#forms)
    - [Validation](#validation)
    - [Error Handling](#error-handling)
    - [Input Masking](#input-masking)
    - [Disabling Buttons](#disabling-buttons)
  - [Template Driven Forms](#template-driven-forms)
    - [Two Way Binding](#two-way-binding)
    - [Template Variables](#template-variables)
  - [RxJS](#rxjs)
    - [Observables, Observers and Subscription](#observables-observers-and-subscription)
    - [RxJS Operators](#rxjs-operators)
    - [Flattening Operators](#flattening-operators)
      - [mergeMap](#mergemap)
      - [switchMap](#switchmap)
      - [concatMap](#concatmap)
      - [exhaustMap](#exhaustmap)
  - [Firebase](#firebase)
    - [Registration and Storing User Data to Firestore](#registration-and-storing-user-data-to-firestore)
  - [Authentication](#authentication)
    - [Checking if User is Logged In](#checking-if-user-is-logged-in)
    - [Initializing Firebase First](#initializing-firebase-first)
  - [Form Submission](#form-submission)
  - [Alert Component](#alert-component)
  - [Custom Validators](#custom-validators)
    - [Async validator](#async-validator)
  - [Routing](#routing)
    - [Registering Routes](#registering-routes)
    - [Routing Module](#routing-module)
    - [Redirecting](#redirecting)
    - [Route Parameters](#route-parameters)
    - [Route Guards](#route-guards)
  - [Uploading Files](#uploading-files)
    - [Drag and Drop File](#drag-and-drop-file)
    - [Uploading Files to Firebase](#uploading-files-to-firebase)
    - [Storing the File Details into the Database](#storing-the-file-details-into-the-database)
    - [Querying the Database](#querying-the-database)
    - [Updating Clips](#updating-clips)
    - [Deleting from the Database](#deleting-from-the-database)
    - [Sorting with Behavior Subjects](#sorting-with-behavior-subjects)
  - [FFmpeg](#ffmpeg)
    - [Initializing FFmpeg](#initializing-ffmpeg)
    - [Generating Screenshots](#generating-screenshots)
    - [Bypassing Angular Sanitation](#bypassing-angular-sanitation)
    - [Selecting a Screenshot and Uploading to Firebase](#selecting-a-screenshot-and-uploading-to-firebase)
    - [Deleting Screenshots from Database and Storage](#deleting-screenshots-from-database-and-storage)
  - [Infinite Scrolling and Fetching Videos](#infinite-scrolling-and-fetching-videos)
    - [CORS Issues](#cors-issues)
  - [Resolving Data with a Guard](#resolving-data-with-a-guard)
  - [Rendering Videos](#rendering-videos)
  - [Lazy Loading](#lazy-loading)
  - [Deployment](#deployment)
  - [Testing](#testing)
    - [Sanity Test](#sanity-test)
    - [Creating Component Instance](#creating-component-instance)
    - [Querying the Template](#querying-the-template)
    - [Nested Components and Content Projection](#nested-components-and-content-projection)
    - [Mocking Services](#mocking-services)
  - [Cypress](#cypress)

## Tailwind Installation

Tailwind is a CSS framework that focuses on utility-first approach. Angular officially supports tailwind. We first need to install the tailwind package using `npm install -D tailwindcss`

We then create the configuration file using `npx tailwind init`. This creates a tailwind.config.js file in the root. We use the following config. The theme option contains properties for modifying colors, font sizes etc.

```js
module.exports = {
  content: ["./src/app/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

To load tailwind into our project, we add the following into our styles.scss to inject the tailwind classes.

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Creating the User Module

The module system of angular allows us to import and export group of files. Modules should group files by feature.

```bash
ng generate module user
```

If a component is declared in another module, we need to explicitly define exports in our user.module file if we need to use it inside components declared outside the module.

```typescript
@NgModule({
  declarations: [AuthModalComponent],
  imports: [CommonModule],
  exports: [AuthModalComponent],
})
```

## Content Projection

Content Projection is used to send content from a parent component to a child component. This is useful for reusable modals. The modal component itself should not render content and should provide a location for rendering content instead. For this app, the **Modal** component will be responsible for rendering the modal and its visibility, while **Authentication Modal** component will be for managing the actual content.

### Multi Slot Content Projection

A component can have multiple slots and each slot can specify a CSS selector that determines which content goes into that slot. We can use this using the **select** attribute of ng-content. We can select an attribute by wrapping it in square brackets. If an element has that attribute, it will be inserted into the corresponding ng-content element.

With Multi Slot Content projection, we can render content in different areas of our component.

```html
<!-- modal.component.html -->
<div class="fixed z-50 inset-0 overflow-y-auto" id="modal">
  <!-- Modal BG Overlay -->
  <!--Title-->
  <div class="flex justify-between items-center pb-4">
    <ng-content select="[heading]"></ng-content>

    <!-- Modal Close Button -->
    <div class="modal-close cursor-pointer z-50">&#x2715;</div>
  </div>
  <div class="modal-close cursor-pointer z-50">&#x2715;</div>
  <ng-content></ng-content>
</div>
```

```html
<!-- auth-modal.component.html -->
<app-modal>
  <p class="text-2xl font-bold" heading>Your Account</p>
  <!-- Tabs -->
  <!-- Login Form -->
  <!-- Registration Form -->
</app-modal>
```

## Services

A service is an object for managing data. Inside of managing data inside the component, we can have a separate class dedicated to managing data. Services are useful when data is needed to be shared across multiple components. In the MVC pattern, we decouple the data (service) from the component class.

As an alternative to services, we can share data between components with Inputs and Outputs.

### Dependency Injection

Dependency injection is a practice for creating objects. Dependency injection creates an object from our class and then pass it into components that needs them.

```typescript
export class ModalComponent implements OnInit {
  constructor(public modal: ModalService) {}

  ngOnInit(): void {}
}
```

To make a class injectable, we can use the **@Injectable** decorator. This tells angular that the class can be injected into a component. The **providedIn** option tells angular where to expose the service. By setting to root, the service will be injected into the root injector and therefore to the whole app. If we don't want our service to be globally available, we can specify where our service can be injected through a module or component. This way, it will only be available to components, directives and pipes within the same module.

```typescript
// shared.module.ts
@NgModule({
  declarations: [ModalComponent],
  imports: [CommonModule],
  exports: [ModalComponent],
  providers: [ModalService],
})
```

We can also register services with components. This way, the service is only available in the component level.

```typescript
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  providers: [ModalService]
})
```

### Modal Visibility

The ModalService should handle updating the visibility of the modal. We can use the **[ngClass]** directive with property binding to set the _hidden_ class.

```html
<div
  class="fixed z-50 inset-0 overflow-y-auto"
  id="modal"
  [ngClass]="{ hidden: !modal.isModalOpen() }"
></div>
```

To open the modal, we can use event binding of the **(click)** event. To prevent redirect upon clicking an anchor element, we can pass the event object into a function.

```html
<a class="px-2" href="#" (click)="openModal($event)">Login / Register</a>
```

```typescript
export class NavComponent implements OnInit {
  constructor(private modal: ModalService) {}

  openModal($event: Event) {
    $event.preventDefault();
    this.modal.toggleModal();
  }
}
```

## Singleton

Singleton design pattern is when one isntance of a class exists in an application. If our app needs an instance of a service, angular will check if an instance already exists and return it, otherwise will create a new instance. In our app, we have one modal service that manages an array of modals using an ID system.

```typescript
interface IModal {
  id: string;
  visible: boolean;
}
@Injectable({
  providedIn: "root",
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}

  register(id: string) {
    this.modals.push({
      id,
      visible: false,
    });
  }

  isModalOpen(id: string): boolean {
    // Boolean(this.modals.find((el) => el.id === id)?.visible)
    return !!this.modals.find((el) => el.id === id)?.visible;
  }

  toggleModal(id: string) {
    const modal = this.modals.find((el) => el.id === id);

    if (modal) {
      modal.visible = !modal.visible;
    }
  }
}
```

Since the modal component is always the child of the component supplying the content, we can use **Input** to send down data to the modal component.

```html
<app-modal modalId="auth">
  <!-- modal content -->
</app-modal>
```

```html
<!-- Auth Modal -->
<div
  class="fixed z-50 inset-0 overflow-y-auto"
  id="modal"
  [ngClass]="{ hidden: !modal.isModalOpen(modalID) }"
></div>
```

```typescript
export class AuthModalComponent implements OnInit {
  constructor(public modal: ModalService) {}

  ngOnInit(): void {
    this.modal.register("auth");
  }
}
```

```typescript
export class ModalComponent implements OnInit {
  @Input() modalID = "";

  constructor(public modal: ModalService) {}

  ngOnInit(): void {}

  closeModal() {
    this.modal.toggleModal(this.modalID);
  }
}
```

## Forms

We need to consider validation, feedback and dynamic fields for forms. To use reactive forms in Angular, we can import the ReactiveFormsModule. We add the following import to `user.module.ts`.

```typescript
@NgModule({
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
})
```

Under the class definition, We import **FormGroup** which is a container for our forms and register a new form with a Form Control object. To bind the form to the template, we can bind the **[formGroup]** directive. The input fields will have to be bound to the controllers as well using **formControlName**.

```typescript
export class RegisterComponent {
  registerForm = new FormGroup({
    name: new FormControl(""),
    email: new FormControl(""),
    age: new FormControl(""),
    password: new FormControl(""),
    confirm_password: new FormControl(""),
    phoneNumber: new FormControl(""),
  });
}
```

```html
<!-- Registration Form -->
<form [formGroup]="registerForm">
  <!-- Name -->
  <div class="mb-3">
    <label class="inline-block mb-2">Name</label>
    <input
      formControlName="name"
      type="text"
      class="block w-full py-1.5 px-3 text-gray-200 border border-gray-400 transition duration-500 focus:outline-none rounded bg-transparent focus:border-indigo-400"
      placeholder="Enter Name"
    />
  </div>
  ...
</form>
```

### Validation

Reactive forms allows validations from the client side. Angular comes with validators out of the box. The second argument for FormControl objects is an array of validators. Angular also allows running validators against a regex through Validators.pattern().

```typescript
name: new FormControl('', [Validators.required, Validators.minLength(3)]),
```

### Error Handling

Errors can be access from the controllers.

```html
<p
  *ngIf="
        registerForm.controls.name.touched &&
        registerForm.controls.name.dirty &&
        registerForm.controls.name.errors?.required
      "
  class="text-red-400"
>
  Field is required
</p>
```

We can create a presentational component for outputting the input and error messages. It doesn't update the data. To bind this input component to the form controls, we can pass the controller through **@Input** decorators. In the register component template, we bind the control property to the registerForm.controls.name object. The control property expects a FormControl object, but the registerForm.controls.name object is an AbstractControl. To be able to bind, we can add the form controls through **this** keyword, instead of directly initializing.

```typescript
export class RegisterComponent {
  name = new FormControl("", [Validators.required, Validators.minLength(3)]);
  email = new FormControl("");
  age = new FormControl("");
  password = new FormControl("");
  confirm_password = new FormControl("");
  phoneNumber = new FormControl("");

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber,
  });
}
```

We can then bind the properties in our register component template to the [control] property of the custom Input component.

```html
<!-- Registration Form -->
<form [formGroup]="registerForm">
  <!-- Name -->
  <div class="mb-3">
    <label class="inline-block mb-2">Name</label>
    <app-input [control]="name" placeholder="Enter Name"></app-input>
  </div>
</form>
```

```typescript
export class InputComponent implements OnInit {
  @Input() control: FormControl = new FormControl();
}
```

In the input template, we need to update the **formControlName** directive, which searches for the control in the form group. We can directly bind to the **control** property using **[formControl]** directive, which allows us to directly bind the form control object to the input element. By wrapping the p element with <ng-container>, we can create an invisible element for grouping elements. We can place common conditions on this container.

```html
<input
  [formControl]="control"
  type="text"
  class="block w-full py-1.5 px-3 text-gray-200 border border-gray-400 transition duration-500 focus:outline-none rounded bg-transparent focus:border-indigo-400"
  placeholder="Enter Name"
/>
<ng-container *ngIf="control.touched && control.dirty">
  <p *ngIf="control.errors?.required" class="text-red-400">Field is required</p>
  <p *ngIf="control.errors?.minlength" class="text-red-400">
    The value you inputted is {{ control.errors?.minlength.actualLength }}
    characters long. It must be at least {{
    control.errors?.minlength.requiredLength }}
  </p>
</ng-container>
```

### Input Masking

For the phone number field, we will need to format the field value. We can use `npm i ngx-mask@13.1.15` and import it to the shared module.

```typescript
imports: [CommonModule, ReactiveFormsModule, NgxMaskModule.forRoot()],
```

Since not all inputs need masking, we should only conditionally apply input masking. In the Input component class file, we can create a property for toggling input masking on the input. The property should be configured by the parent component, and if no value is passed, we should assume it as disabled, which can be achieved by setting the value into an empty string.

```typescript
  @Input() format = '';
```

In the template file, we bind the **[mask]** directive to the format property we created. The **[dropSpecialCharacters]** option is set to false to keep the special characters.

```html
<input
  [formControl]="control"
  [type]="type"
  class="block w-full py-1.5 px-3 text-gray-200 border border-gray-400 transition duration-500 focus:outline-none rounded bg-transparent focus:border-indigo-400"
  [placeholder]="placeholder"
  [mask]="format"
  [dropSpecialCharacters]="false"
/>
```

To apply the masking for the phone number, we use the following masking format. The parentheses and dashes will be automatically added by the library.

```html
<app-input
  [control]="phoneNumber"
  placeholder="Enter Phone Number"
  format="(000)000-0000"
></app-input>
```

### Disabling Buttons

The FormGroup object contains properties for checking validity of the form. We bind the button's **[disable]** property to the form group's invalid property.

```html
<button
  type="submit"
  class="block w-full bg-indigo-400 text-white py-1.5 px-3 rounded transition hover:bg-indigo-500 disabled:opacity-50 disabled:bg-indigo-400"
  [disabled]="registerForm.invalid"
>
  Submit
</button>
```

## Template Driven Forms

Template Driven Forms are configured directly from the template. It has a lower learning curve, but is more difficult to scale. Behind the scenes, the **FormsModule** registers the forms in our template into an NgForm, which creates a FormGroup instance automatically.

### Two Way Binding

Two way data binding allows us to listen to events and update a property simultaneously. To help Angular identify the controls in our form, we can use the **NgModel** directive. Before adding the directive, we also need to assign a name property to the input which will be used as the id for the control. To use two way binding, we combine both property binding and event binding. It will set the value for an element using property binding at the same time it emits an event whenever the value changes.

```html
<input
  name="email"
  [(ngModel)]="credentials.email"
  type="email"
  class="block w-full py-1.5 px-3 text-gray-200 border border-gray-400 transition duration-500 focus:outline-none rounded bg-transparent focus:border-indigo-400"
  placeholder="Enter Email"
/>
```

### Template Variables

We can access the properties in the form group using template variables. The hash character allows us to declare variables in a template.

```html
<!-- Login Form -->
<form #loginForm="ngForm">
  <!-- Email -->
  <div class="mb-3">
    <label class="inline-block mb-2">Email</label>
    <!-- <input [value]="" (change)="" /> -->
    <input
      #email="ngModel"
      name="email"
      required
      pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
      [(ngModel)]="credentials.email"
      type="email"
      class="block w-full py-1.5 px-3 text-gray-200 border border-gray-400 transition duration-500 focus:outline-none rounded bg-transparent focus:border-indigo-400"
      placeholder="Enter Email"
    />
    <p
      *ngIf="email.errors && email.touched && email.dirty"
      class="text-red-400"
    >
      Email is invalid.
    </p>
  </div>
</form>
```

## RxJS

RxJS is a library for filtering, sorting and coordinating data.

### Observables, Observers and Subscription

Observables are wrappers around a data source. Data can come from an asynchronous operation, mouse events, http requests, etc. An observable instance has a **subscribe()** function which allows us to pass in an Observer. The **next()** function is responsible for handling data pushed into the Observable. The **value** argument refers to the data emitted by the observable.

Observers are responsible for receiving the data after an Observable emitted the data. An Observer establishing a connection with an Observable is a **Subscription**. We can have multiple subscribers to a single Observable. An observer object can have three functions: emitting value, handling errors, and handling completion of an observable. The return function of the Observable is executed whenever it completes or an Observer unsubscribes. When unsubscribing an Observer, its complete function is not called however.

### RxJS Operators

RxJS Operators are functions that are used to help control an observable's stream of data. This allows us to write declaratively. **Creation Operators** are operators that can create new observables from events, requests, intervals, etc. **Pipeable Operators** takes an observable as an input and outputs a new observable, which allows us to modify data before pushing it to an Observer.

### Flattening Operators

Flattening Operators are operators used for subscribing to inner observables. Their values will get pushed into the next operator.

#### mergeMap

Subscribes to the incoming observable as soon as received. Does not limit the number of active inner observables.

#### switchMap

The same as mergeMap, except it limits the number of active inner observables to 1. If a new value is pushed into the pipeline, a new observable will be created, made active and the previous observable will be completed. Useful for managing one active subscription at a time.

#### concatMap

Queues inner observables. Limits active observables to 1, however newer subscriptions are placed into a queue and will not be subscribed to until the current observable is completed.

#### exhaustMap

Ignores incoming observables if an observable is currently active. As long as there is an active subscription, subsequent observables are ignored. Useful if we need a current Observable to complete before moving on such as with forms to prevent duplicate submissions.

## Firebase

Firebase is a suite of backend tools that can be used for web applications. We can store data, authenticate users, store files, provide analytics etc. For the database, we use Firestore database. AngularFire is used to interact with Firebase and can be added to the project using `ng add @angular/fire`. We add the firebase configuration into our environment variables.

```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    appId: "",
  },
};
```

The authDomain is the URL for handling credentials. The storageBucket is the location where files are stored. We can then intitialize firebase into our app by importing the **AngularFireModule** into our app.module. Likewise, we also import **AngularFireAuthModule** to use the authentication service.

```typescript
  imports: [
    BrowserModule,
    AppRoutingModule,
    UserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
  ],
```

### Registration and Storing User Data to Firestore

To register a new user, we first need to turn on the Authentication feature in firebase. We use the Email provider. The **createUserWithEmailAndPassword** method returns a promise, so we will need to use async/await.

We also create a model, which is an interface for describing and manipulating data in a database. Whenever we create a collection, it is a good idea to create a model for describing the documents.

```typescript
export default interface IUser {
  email: string;
  password: string;
  age: number;
  name: string;
  phoneNumber: string;
}
```

```typescript
export class RegisterComponent {
  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {}
  inSubmission = false;

  async register() {
    // reset message
    this.showAlert = true;
    this.alertMsg = "Please wait. Your account is being created.";
    this.alertColor = "blue";
    this.inSubmission = true;

    try {
      await this.auth.createUser(this.registerForm.value);
    } catch (e) {
      console.error(e);
      this.alertMsg = "An unexpected error occurred. Please try again later";
      this.alertColor = "red";
      this.inSubmission = false;

      // stop function from executing further
      return;
    }

    this.alertMsg = "Success! Your account has been created.";
    this.alertColor = "green";
  }
}
```

The **AngularFirestoreCollection** class is a helper class for annotation properties to a collection. In this case, we use the IUser interface generic.

```typescript
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
    this.usersCollection = db.collection("users");
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error("Password not provided!");
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    if (!userCred.user) {
      throw new Error("User can't be found");
    }

    // save user info to db, including its uid
    await this.usersCollection.doc(userCred.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
    });

    // update user display name and profile picture
    await userCred.user.updateProfile({
      displayName: userData.name,
    });
  }
}
```

## Authentication

Authentication is mainly handled on the server side. The login data is sent to the server, which then responds with a token upon successful authentication. Firebase uses IndexedDB api for storing structured data on the user's browsers. After storing the token, we send it back to Firebase with each request and checks the token.

**Stateless Authentication** is where the server does not actively keep track of who is logged in. A token is used to verify the user instead. It is common to user stateless authentication for SPAs. Traditionally, applications keep track of users using **Sessions** which are stored on the server.

With the Firebase SDK, the tokens are stored on our behalf. In addition, whenever we initiate a request, firebase will attach the token with our requests automatically.

### Checking if User is Logged In

We can retrieve the current logged in user by subscribing to the AngularFireAuth observable. We can convert the user into a boolean by using the map operator combined with double negation.

```typescript
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;

  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
    this.usersCollection = db.collection('users');
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));
  }
```

To subscribe to the observable directly from within a template, we can use an async pipe. The values pushed by the observable will be pushed to the directive.

```typescript
export class NavComponent implements OnInit {
  constructor(public modal: ModalService, public auth: AuthService) {}
```

```html
<li *ngIf="!(auth.isAuthenticated$ | async); else authLinks">
  <a class="px-2" href="#" (click)="openModal($event)">Login / Register</a>
</li>
<ng-template #authLinks>
  <li>
    <a class="px-2" href="#">Manage</a>
  </li>
  <li>
    <a class="px-2" href="#">Upload</a>
  </li>
</ng-template>
```

### Initializing Firebase First

By initializing Firebase first, we will be able to determine if a user is logged in ahead of time. We need to modify the main.ts file, which is the entry point of the app.

```typescript
firebase.initializeApp(environment.firebase);

let appInit = false;

firebase.auth().onAuthStateChanged(() => {
  if (!appInit) {
    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  }
  appInit = true;
});
```

## Form Submission

The form submission is handled using a custom event emitted by the FormGroup object. Angular provides the **(ngSubmit)** custom event for listening to submission events.

```html
<form [formGroup]="registerForm" (ngSubmit)="register()"></form>
```

## Alert Component

For teh alert component, we will allow a parent component to project content into it. We create a `get bgColor()` allows us to access the value returned by the function as a property. It allows us to create properties with extra logic before the property is set. We bind this property into the **[ngClass]** property.

```typescript
export class AlertComponent implements OnInit {
  @Input() color = "blue";
  // function for returning tailwind color
  get bgColor() {
    return `bg-${this.color}-400`;
  }
}
```

```html
<div
  class="text-white text-center bold p-4 mb-4 rounded-md"
  [ngClass]="bgColor"
>
  <ng-content></ng-content>
</div>
```

To allow the above behavior, we need to configure the tailwind.config file with a safelist option.

```js
module.exports = {
  content: ["./src/app/**/*.{html,ts}"],
  safelist: ["bg-blue-400", "bg-green-400", "bg-red-400"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

We then proceed in using the alert component in our register template and add the properties into the class file.

```html
<app-alert *ngIf="showAlert" [color]="alertColor"> {{ alertMsg }} </app-alert>
```

## Custom Validators

Validators are classes which accept a form group to perform validation. We can use custom validators to validate if an email is already taken, or if passwords match against the confirmation password. We can add validators to form groups and by doing so, we will be given access to all form controls registered in a group.

To be able to customize controls used by our validators, we can make the validator a factory function. Angular automatically manages errors on our behalf. It will automatically update the errors property based on the value returned by a validator function. We can manually set an error using the **Control.setErrors()** method.

```typescript
export class RegisterValidators {
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        console.error("Form controls cannot be found in the form group");
        return {
          controlNotFound: false,
        };
      }

      const error =
        control.value === matchingControl.value ? null : { noMatch: true };
      matchingControl.setErrors(error);

      return error;
    };
  }
}
```

We can then invoke the validator on the formgroup:

```typescript
registerForm = new FormGroup(
  {
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber,
  },
  [RegisterValidators.match("password", "confirm_password")]
);
```

```html
<!--  password confirmation -->
<p *ngIf="control.errors?.noMatch" class="text-red-400">
  Passwords do not match.
</p>
```

### Async validator

Angular provides the **AsyncValidator** interface for asynchronous validators. For the validate method, if we return an object, then angular will assume that the control did not pass validation and will add the object to the errors property of the respective control. We will need to inject this class to other classes, so we need to annotate the class with Injectable and provide it to root.

```typescript
@Injectable({
  providedIn: "root",
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
```

We pass it in as the third argument for our form control.

```typescript
export class RegisterComponent {
  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}

  email = new FormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailTaken.validate]
  );
```

```html
<!-- Email is not unique -->
<p *ngIf="control.errors?.emailTaken" class="text-red-400">
  Email taken. Please try another email.
</p>
```

## Routing

Routing is the concept of serving different resources based on a URL. Traditionally, routing is handled on the backend.

### Registering Routes

Every route in the app should be associated to a component.

```typescript
const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "about",
    component: AboutComponent,
  },
];
```

To render the component into the template, we use the `router-outlet` tags

```html
<app-nav></app-nav>

<router-outlet></router-outlet>

<app-auth-modal
  *ngIf="!(auth.isAuthenticatedWithDelay$ | async)"
></app-auth-modal>
```

To add navigation links, we use the **routerLink** directive. To add styling to links pointing to the current active path, we use the **routerLinkActive** directive to apply a class if the path is active. We can also apply the routerLinkActive to parent elements

```html
<li routerLinkActive="text-indigo-400">
  <a
    class="px-2"
    routerLink="/about"
    routerLinkActive="text-indigo-400"
    [routerLinkActiveOptions]="{ exact: true }"
    >About</a
  >
</li>
```

### Routing Module

It is acceptable to have multiple routing modules in an app for easier management.

```bash
ng g module Video --routing
```

This time, the module is imported with the **forChild** function. We need to make sure to import this module into our app.module

```typescript
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
```

```typescript
@NgModule({
  declarations: [AppComponent, NavComponent, HomeComponent, AboutComponent],
  imports: [
    VideoModule,
  ],
})
```

### Redirecting

We can add static data to a route by adding the **data** property to our route.

```typescript
const routes: Routes = [
  {
    path: "manage",
    component: ManageComponent,
    data: {
      authOnly: true,
    },
  },
];
```

The **ActivatedRoute** is a service we can inject to gather information about the currently route. The data property stores an observable that pushes data from the current route. However, the router does not make the data accessible to components or services defined outside the router-outlet.

Since our auth service lives outside the router-outlet, we won't be able to access the data property. We can instead listen to events through our router by subscribing in the constructor of the auth service.

```typescript
// subscribe to router for NavigationEnd events
this.router.events
  .pipe(
    filter((e) => e instanceof NavigationEnd),
    map((e) => this.route.firstChild),
    // subscribe to inner observable and retrieve the route data
    // returns empty observable as fallback using nullish coalescing
    switchMap((route) => route?.data ?? of({}))
  )

  .subscribe((data) => {
    this.redirect = data.authOnly ?? false;
  });
```

### Route Parameters

We can use route parameters for generating pages based on the route:

```typescript
  {
    path: 'clip/:id',
    component: ClipComponent,
  },
```

To retrieve a value from the URL, we can use **ActivatedRoute** params observable which pushes values whenever the route parameters changes.

```typescript
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });
  }
```

Query parameters allows us to update data while staying on the page such as filtering/sorting data.

```typescript
export class ManageComponent implements OnInit {
  videoOrder = "1"; // 1 = asc 2 = desc

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === "2" ? params.sort : "1";
    });
  }

  sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;
    this.router.navigateByUrl(`/manage?sort=${value}`);
  }
}
```

Another possible solution is by using Router **navigate** function wherein we construct a path and define query parameters:

```typescript
  sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }
}
```

Alternatively, we can also bind the **queryParams** property in the template. This way, every time we navigate to the manage page, Angular will automatically add the query parameter of sort=1.

```html
<li>
  <a
    class="px-2"
    routerLink="/manage"
    routerLinkActive="text-indigo-400"
    [routerLinkActiveOptions]="{ exact: true }"
    [queryParams]="{ sort: 1 }"
    >Manage</a
  >
</li>
```

To persist the selection upon page reload, we can use either the ngModel directive, or bind the select attribute to the videoOrder property.

```html
<select
  (change)="sort($event)"
  class="text-black px-8 text-xl outline-none appearance-none"
>
  <option value="1" [selected]="videoOrder === '1'">Recent Uploads</option>
  <option value="2" [selected]="videoOrder === '2'">Oldest Uploads</option>
</select>
```

### Route Guards

A Guard is a function that will run before navigation is performed. We can use **AngularFireAuthGuard** as the argument for a route's canActivate property. We can then add the **redirectUnauthorizedTo** to the authGuardPipe property in our route data.

```typescript
const redirectUnauthorizedToHome = () => redirectUnauthorizedTo("/");

const routes: Routes = [
  {
    path: "manage",
    component: ManageComponent,
    data: {
      authOnly: true,
      authGuardPipe: redirectUnauthorizedToHome,
    },
    canActivate: [AngularFireAuthGuard],
  },
];
```

## Uploading Files

The client is responsible for transferring the file to the server while the server validates the upload, stores the file and exposes the API for the client to send the file. Firebase cloud storage provides hosting for user generated content which we will use for storing file uploads.

### Drag and Drop File

We need to disable the default behavior of the browser when dragging and dropping files. We can access the host element using the HostListener decorator.

```typescript
@Directive({
  selector: "[app-event-blocker]",
})
export class EventBlockerDirective {
  @HostListener("drop", ["$event"])
  @HostListener("dragover", ["$event"])
  public handleEvent(event: Event) {
    event.preventDefault();
  }
}
```

```html
<div
  (dragend)="isDragover = false"
  (dragover)="isDragover = true"
  (dragenter)="isDragover = true"
  (dragleave)="isDragover = false"
  (mouseleave)="isDragover = false"
  (drop)="storeFile($event)"
  [ngClass]="{
        'bg-indigo-400 border-indigo-400 border-solid': isDragover
      }"
  app-event-blocker
  class="w-full px-10 py-40 rounded text-center cursor-pointer border border-dashed border-gray-400 transition duration-500 hover:text-white hover:bg-indigo-400 hover:border-indigo-400 hover:border-solid text-xl"
>
  <h5>Drop your file here (mp4 only!)</h5>
</div>
```

The drop event will pass along the file the user has dropped through the event objec

### Uploading Files to Firebase

To upload files to firebase, we need to import **AngularFireStorageModule** to the app.module and the **AngularFireStorage** service.

```typescript
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
```

We need to update the firebase rules under Storage:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // file size limits
      allow read: if true;
      // check if authenticated, limit to 25MB
      allow write: if request.auth !=null &&
      	request.resource.contentType == 'video/mp4' &&
        request.resource.size < 25 * 1000 * 1000;
    }
  }
}
```

### Storing the File Details into the Database

To store the information of the user who uploaded the file, we can inject the **AngularFireAuth** service. We also need to create a reference to the file, which should point to the file.

```typescript
export class UploadComponent implements OnInit {
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
  }

  uploadFile()
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
        next: (url) => {
          // clip information
          const clip = {
            uid: this.user?.uid,
            displayName: this.user?.displayName,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };
          this.clipsService.createClip(clip);
        },,
      });
  }
}
```

### Querying the Database

To retrieve the list of clips uploaded, we can add the following method to our clips service.

```typescript
  getUserClips() {
    return this.auth.user.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref.where('uid', '==', user.uid);
        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }
```

```typescript
export class ManageComponent implements OnInit {
  clips: IClip[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1';
    });

    this.clipService.getUserClips().subscribe((docs) => {
      // the observable will always push a fresh list of docs
      // we should reset to prevent dupes
      this.clips = [];

      docs.forEach((doc) => {
        this.clips.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    });
  }
```

### Updating Clips

We create a new method in our ClipService for updating clips in the database.

```typescript
  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title: title,
    });
  }
```

```typescript
  async submit() {
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

    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!';
  }
```

To trigger an update, we need to send the data back to the parent (manage) component from the child (edit). The **Output** decorator allows a parent component to listen to an event. We can generate a custom event using **EventEmitter**.

```typescript
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();

  async submit() {
    if (!this.activeClip) {
      return;
    }
    // send data to firebase
    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch (e) {
      console.error(e);
      return;
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);
  }
}
```

Manage template:

```html
<app-edit [activeClip]="activeClip" (update)="update($event)"></app-edit>
```

Manage component:

```typescript
  // update edited clip title
  update($event: IClip) {
    this.clips.forEach((el, idx) => {
      if (el.docID == $event.docID) {
        this.clips[idx].title = $event.title;
      }
    });
  }
```

### Deleting from the Database

For deleting, we need to delete the file itself - in the storage and the document in the database. Once removed, we will also need to remove the clip from the page. Before doing so, we need to modify the storage security rules.

```
      // allow delete if user is authenticated
      allow delete: if request.auth !=null;
```

We then add the method for deleting to our service, which uses the AngularFirestore and AngularFireStorage services.

```typescript
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {
    this.clipsCollection = db.collection("clips");
  }

  async deleteClip(clip: IClip) {
    // create the reference to the file to be deleted
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);

    // delete the clip from the storage
    await clipRef.delete();
    // delete the document
    await this.clipsCollection.doc(clip.docID).delete();
  }
}
```

```typescript
  deleteClip($event: Event, clip: IClip) {
    $event.preventDefault();
    this.clipService.deleteClip(clip);
    // remove deleted clip from the array
    this.clips.forEach((el, idx) => {
      if (el.docID == clip.docID) {
        this.clips.splice(idx, 1);
      }
    });
  }
```

### Sorting with Behavior Subjects

BehaviorSubject can act both as an observer and observable at the same time. A subject can push a value while being subscribed to an observable. In our case, whenever the videoOrder property is updated, we push a new value to our observable. We pass this sort$ object into the getUserClips method of the Clip Service.

```typescript
export class ManageComponent implements OnInit {
  videoOrder = '1'; // 1 = asc 2 = desc
  sort$: BehaviorSubject<string>;

  constructor() {
    this.sort$ = new BehaviorSubject(this.videoOrder);
    // this.sort$.subscribe(console.log);
    // this.sort$.next('test');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1';
      this.sort$.next(this.videoOrder);
    });


    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
      // the observable will always push a fresh list of docs
      // we should reset to prevent dupes
      this.clips = [];

      docs.forEach((doc) => {
        this.clips.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    });
  }
```

In the Clip Service, we subscribe to both the user, and the new sort observable at the same time with the **combineLatest** operator. Whenever either observable pushes a value, the combineLatest operator will push it onto the pipeline.

```typescript
  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((values) => {
        // destructure from array of observables
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');
        return query.get();
      }),
      // return the docs array
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }
```

## FFmpeg

We use `ffmpeg.wasm` to generate screenshots from videos. We will need the core and FFmpeg packages `@ffmpeg/ffmpeg @ffmpeg/core`. The core package exports ffmpeg as a web assembly file. The ffmpeg package exposes a javascript api for interacting with ffmpeg. The files are stored in `node_modules/@ffmpeg/core/dist` which we need to include in Angular. We need to add the following options to angular.json.

```json
      "architect": {
            "assets": [
              {
                "input": "node_modules/@ffmpeg/core/dist",
                "output": "node_modules/@ffmpeg/core/dist",
                "glob": "*"
              }
            ],
```

We also need to install type definitions for node `@types/node`. We need to import the type definitions and update the project typescript configuration as well.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": ["node"]
  },
  "files": ["src/main.ts", "src/polyfills.ts"],
  "include": ["src/**/*.d.ts"]
}
```

Web workers are scripts that run on a different thread than the main application. Web workers however does not have access to the document. SharedArrayBuffers are objects shared between the main thread and web workers. To enable support for **SharedArrayBuffer**, we add the following in our angular.json:

```json
        "serve": {
          "options": {
            "headers": {
              "Cross-Origin-Opener-Policy": "same-origin",
              "Cross-Origin-Embedder-Policy": "require-corp"
            }
          }
```

### Initializing FFmpeg

We start by creating a service for lazy loading ffmpeg. The **createFFmpeg()** factory function creates an instance but does not load the wasm file. Since ffmpeg is a large file, we need to initialize it without blocking the main thread.

```typescript
export class FfmpegService {
  public isReady = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    // check if ffmpeg has already loaded
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();
    this.isReady = true;
  }
}
```

We then initialize ffmpeg into the upload component. We also update the template so that the forms are unavailable while ffmpeg is still being initialized.

```typescript
export class UploadComponent implements OnDestroy {
  constructor(public ffmpegService: FfmpegService) {
    this.ffmpegService.init();
  }
}
```

```html
<ng-container>
  <span
    *ngIf="!ffmpegService.isReady; else uploadEditorCtr"
    class="material-symbols-outlined text-center text-6xl p-8 animate-spin"
  >
    settings
  </span>
</ng-container>

<ng-template #uploadEditorCtr>
  <!-- Upload Dropbox -->
  <ng-container *ngIf="!nextStep; else uploadFormCtr"> </ng-container>

  <!-- Video Editor -->
  <ng-template #uploadFormCtr> </ng-template>
</ng-template>
```

### Generating Screenshots

We first need to save the video file to memory. Before we can send the file, it needs to be converted to binary data. FFmpeg provides the **fetchFile()** function for converting to binary and **FS()** for accessing the independent memory system.

The ffmpeg command line tools comes with **ffmpeg** for processing video and audio files. **ffplay** is used for playing media files and **ffprobe** for reading files such as metadata. For generating screenshots, we use ffmpeg. We can use the **run()** function and pass [options](https://www.ffmpeg.org/ffmpeg.html#Options).

After generating the screenshots, we need to create the URL's. We can do so by converting from a binary to a string. We can do so using blobs.

```typescript
  async storeFile($event: Event) {
    // check for drag and drop, otherwise use input fallback

    // process the file
    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
  }
```

```typescript
  async getScreenshots(file: File) {
    // convert to binary
    const data = await fetchFile(file);

    // store to memory
    this.ffmpeg.FS('writeFile', file.name, data);

    // pick timestamps for generating images
    const seconds = [1, 2, 3];
    const commands: string[] = [];

    seconds.forEach((second) => {
      commands.push(
        // input
        '-i',
        file.name,
        // output options
        // grab screenshot from timestamp
        '-ss',
        `00:00:0${second}`,
        // configure number of frames (1)
        '-frames:v',
        '1',
        // resize image and maintain aspect ratio
        '-filter:v',
        'scale=510:-1',
        // output
        `output_0${second}.png`
      );
    });

    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];

    seconds.forEach((second) => {
      // grab the file from the isolated file system
      const screenshotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${second}.png`
      );
      // convert binary to URL using blobs
      const screenshotBlob = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });
      const screenshotUrl = URL.createObjectURL(screenshotBlob);
      screenshots.push(screenshotUrl);
    });

    return screenshots;
  }
```

### Bypassing Angular Sanitation

Hyperlinks and resources are sanitized by angular automatically. For bypassing sanitation, we can use a custom pipe. The **DomSanitizer** class can be used for bypassing sanitation.

```typescript
export class SafeURLPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string) {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }
}
```

```html
<div
  *ngFor="let screenshot of screenshots"
  class="border-8 cursor-pointer border-green-400"
>
  <img [src]="screenshot | safeURL" />
</div>
```

### Selecting a Screenshot and Uploading to Firebase

We can create a new property in the class file which corresponds to the selected screenshot. We also need to add a click event on the div tag.

```html
<div
  *ngFor="let screenshot of screenshots"
  class="border-8 cursor-pointer"
  (click)="selectedScreenshot = screenshot"
  [ngClass]="{
                'border-green-400': screenshot === selectedScreenshot,
                'border-transparent': screenshot !== selectedScreenshot
              }"
>
  <img [src]="screenshot | safeURL" />
</div>
```

We need to update our firebase rules to allow images.

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // file size limits
      allow read: if true;
      // check if authenticated, limit to 25MB
      allow write: if request.auth !=null &&
      	(
        request.resource.contentType == 'video/mp4' ||
        request.resource.contentType == 'image/png'
        ) &&
        request.resource.size < 25 * 1000 * 1000;
      // allow delete if user is authenticated
      allow delete: if request.auth !=null;

    }
  }
}
```

Firebase accepts blobs, however the URL's created by our app point to the system memory. The function will create a blob from the URL. The component does not have access to the blob object itself, so we will need to create a function to grab a blob.

```typescript
  async blobFromURL(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    return blob;
  }
```

```typescript
export class UploadComponent implements OnDestroy {
  screenshotTask?: AngularFireUploadTask;

  async uploadFile() {
    // grab the blob
    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    );

    // define firebase path and filename
    const screenshotPath = `screenshots/${clipFileName}.png`;

    // upload thumbnail
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
}

```

We need to also store the URL of our thumbnail to firebase. The **forkjoin** operator accepts an array of observables. Values are not pushed into the subscriber until all observables have completed. Upon completion, the latest values pushed by each observable is streamed to the subscriber.

```typescript
// check for upload state, using the last observable pushed
forkJoin([this.task.snapshotChanges(), this.screenshotTask.snapshotChanges()])
  .pipe(
    switchMap(() =>
      forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
    )
  )
  .subscribe({

    },
  });
```

### Deleting Screenshots from Database and Storage

If a user deletes a clip, its related screenshot should be deleted too.

```typescript
  async deleteClip(clip: IClip) {
    // create the reference to the file to be deleted
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );

    await clipRef.delete();
    await screenshotRef.delete();

    // delete the document
    await this.clipsCollection.doc(clip.docID).delete();
  }
```

## Infinite Scrolling and Fetching Videos

We can implement infinite scrolling for the homepage. Loading additional clips can be triggered when the user scrollls to the bottom of the page.

```typescript
export class ClipsListComponent implements OnInit, OnDestroy {
  constructor(public clipService: ClipService) {
    this.clipService.getClips();
  }

  ngOnInit(): void {
    window.addEventListener("scroll", this.handleScroll);
  }

  ngOnDestroy(): void {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    // offsetHeight = height of whole page
    // innerHeight = height of the viewable area
    // scrollTop = distance from the top of the page to the top of the viewable area
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    // check if innerHeight + scrollTop = offsetHeight
    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      this.clipService.getClips();
    }
  };
}
```

Inside the clip service, we need to create a query for retrieving a list of clips. Firebase provides the function for skipping results with **startAfter()**.

```typescript
  async getClips() {
    if (this.pendingRequest) {
      return;
    }

    this.pendingRequest = true;

    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);

    const { length } = this.pageClips;
    if (length) {
      // grab the last clip from the current array
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipsCollection
        .doc(lastDocID)
        .get()
        .toPromise();

      // skip the documents before the last
      query = query.startAfter(lastDoc);
    }
    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data(),
      });
    });

    this.pendingRequest = false;
  }
```

### CORS Issues

Resources are files downloaded by the browser such as videos, images, fonts, web pages, general asset files.

```html
<img
  class="card-img-top rounded-tl-2xl w-full"
  [src]="clip.screenshotURL"
  crossorigin
/>
```

We can use the Access-Control-Allow-Origin header to allow images to load from firebase. To do so, we need to enable them in Google Cloud. Google Cloud can read a cors.json file for configuring its cors settings.

```json
[
  {
    "origin": ["*"],
    "responseHeader": ["Content-Type"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

Using `gsutil`, we can upload the configuration settings. Or we can also use the cloud shell. [guide](https://stackoverflow.com/questions/37760695/firebase-storage-and-access-control-allow-origin/58613527#58613527)

```bash
gsutil cors set cors.json gs://ng-gank.appspot.com
```

## Resolving Data with a Guard

We can use Resolvers to retrieve data from the database. The router will run the **resolve()** function before loading the component whenever the user visits the route. The resolve() function will return a document from the clips collection and can be access through the property's name, in this case: clip.

```typescript
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection
      .doc(route.params.id)
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.data();

          // redirect to homepage if no data was found
          if (!data) {
            this.router.navigate(['/']);
            return null;
          }

          return data;
        })
      );
  }
```

We need to register the resolver to our route manually.

```typescript
const routes: Routes = [
  {
    path: "clip/:id",
    component: ClipComponent,
    resolve: {
      clip: ClipService,
    },
  },
];
```

## Rendering Videos

To render videos, we use the libraries `video.js @types/video.js @videojs/themes`. We can select the template element into the class file with the **@ViewChild** decorator.

```html
<video #videoPlayer controls class="video-js vjs-theme-forest mx-auto">
  <source src="assets/video/hero.webm" type="video/webm" />
</video>
```

Whenever we select an element with ViewChild, the property will store an instance of the **ElementRef** class. By setting the static property to true, the ViewChild decorator will update the property with the element before ngOnInit is called.

```typescript
export class ClipComponent implements OnInit {
  @ViewChild("videoPlayer", { static: true }) target?: ElementRef;
  player?: videojs.Player;
  clip?: IClip;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // initialize player
    this.player = videojs(this.target?.nativeElement);

    this.route.data.subscribe((data) => {
      this.clip = data.clip as IClip;
      this.player?.src({
        src: this.clip.url,
        type: "video/mp4",
      });
    });
  }
}
```

We can import the styles for the video player. By default, angular encapsulates CSS to a single component. We can turn off view encapsulation by configuring the component options.

```scss
@import "~video.js/dist/video-js.css";
@import "~@videojs/themes/dist/forest/index.css";
```

```typescript
@Component({
  encapsulation: ViewEncapsulation.None
})
export class ClipComponent implements OnInit {
```

## Lazy Loading

Lazy loading is a webpack features to optimize an application. A chunk is a piece of our application and by default, webpack bundles into as few files as possible. We can configure webpack to customize this behavior. We can lazy load the entire video module. This module will only be loaded when the user visits the manage or upload page. We need to add the following in our app-routing-module:

```typescript
  {
    path: '',
    loadChildren: async () =>
      (await import('./video/video.module')).VideoModule,
  },
```

## Deployment

Angular Budgets is a feature wherein filesize is checked against a threshold. We can modify this in angular.json

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "5mb",
    "maximumError": "5mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "50kb",
    "maximumError": "50kb"
  }
],
```

We also configured our firestore database rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
    // allow anyone to read the database
		allow read: if true;
    // allow overwrite permissions only to owners
    allow write: if request.auth.uid == resource.data.uid;

    // allow authenticated users to create resource
    allow create: if request.auth.uid != null;

    // allow delete only to owners
    allow delete: if request.auth.uid == resource.data.uid;
    }
  }
}
```

The angular app is deployed in Vercel. Since our app uses ffmpeg, we will need additional configuration for the headers. Vercel allows us to modify the headers through `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

## Testing

For testing angular apps, Karma and Jasmine are used. Karma is a test runner which creates a server to load the application and tests automatically, while Jasmine is the test framework. We can configure the Karma configuration settings in `karma.conf.js`. Jasmine can also be configured within this file. To test a n angular app, we use the test command:

```json
"test": "ng test"
```

### Sanity Test

A sanity test is a test that always passes. This is used to verify that the tools are set up correctly.

```typescript
describe("App Component", () => {
  it("should pass sanity test", () => {
    expect(true).toBeTruthy();
  });
});
```

### Creating Component Instance

Jasmine allows us to run code before a test is executed using **beforeEach()** however neither Karma or Jasmine can interact with an Angular application. The **TestBed** class initializes environment for testing and provides methods for creating components and services. To load a component's template, we can use **compileComponents()**. We also need to create an instance of the component using **ComponentFixture** which is a wrapper around a component and gives us methods and properties for accessing the components.

```typescript
describe("About Component", () => {
  let fixture: ComponentFixture<AboutComponent>;
  let component: AboutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutComponent],
    }).compileComponents();
  });

  // create a new instance for each test
  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create a component", () => {
    expect(component).toBeTruthy();
  });
});
```

### Querying the Template

The **fixture.debugElement** property is used for referencing the entire template. We can select an element using the **query()** function. We can generate a selector using **By.css()**. We can also change the properties of the instance through the component.

```typescript
it("should have .hidden class", () => {
  const element = fixture.debugElement.query(By.css(".hidden"));
  expect(element).toBeTruthy();
});

it("should NOT have .hidden class", () => {
  component.active = true;
  fixture.detectChanges();

  const element = fixture.debugElement.query(By.css(".hidden"));
  expect(element).not.toBeTruthy();
});
```

### Nested Components and Content Projection

The TestBed object does not have a solution for adding content to a component. We need to create a dummy host component for dealing with nested components.

```typescript
@Component({
  template: ` <app-tabs-container>
    <app-tab tabTitle="Tab 1"></app-tab>
    <app-tab tabTitle="Tab 2"></app-tab>
  </app-tabs-container>`,
})
class TestHostComponent {}

describe("TabsContainerComponent", () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabsContainerComponent, TestHostComponent, TabComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have two tabs", () => {
    const tabs = fixture.debugElement.queryAll(By.css("li"));
    expect(tabs.length).toBe(2);
  });
});
```

### Mocking Services

Mocking is the process of creating a fake dependency. We can use the **createSpyObj()** from jasmine, which will count the number of times a method is called. The logout link should call the logout() method from the auth service. We can emit an observable that returns a true value for isAuthenticated$. We would then need to override the auth service with our fake service. We can do so by adding it in the providers array of the TestBed. The debugElement object is a platform agnostic reference to an element. It does not contain the same methods and properties on a regular DOM object. We can trigger a click using **triggerEventHandler()**.

```typescript
const mockAuthService = jasmine.createSpyObj(
  "AuthService",
  ["createUser", "logout"],
  {
    isAuthenticated$: of(true),
  }
);

beforeEach(async () => {
  await TestBed.configureTestingModule({
    declarations: [NavComponent],
    imports: [RouterTestingModule],
    providers: [{ provide: AuthService, useValue: mockAuthService }],
  }).compileComponents();
});

it("should be able to click logout button", () => {
  const logoutLink = fixture.debugElement.query(By.css("li:nth-child(3) a"));
  expect(logoutLink).withContext("User is not logged in").toBeTruthy();

  logoutLink.triggerEventHandler("click");
  // verify logout function was called
  const service = TestBed.inject(AuthService);
  expect(service.logout)
    .withContext("Could not click logout link")
    .toHaveBeenCalledTimes(1);
});
```

## Cypress

E2E testing is a way to check if an application is behaving correctly by automating a browser to mimic user behavior. We can install cypress using `ng add @cypress/schematic`. The tests are containeed in the `cypress/e2e` directory. The fixtures directory contains dummy data which will be available globally. The support directory contains files that will be loaded before the test runs.

We can run jquery functions with **invoke()**

```typescript
describe("Clip", () => {
  it("should play clip", () => {
    // visit homepage
    cy.visit("/");
    // click on first clip
    cy.get("app-clips-list > .grid a:first").click();
    // click on video player
    cy.get(".video-js").click();
    // wait 3 sec
    cy.wait(3000);
    // click on video player
    cy.get(".video-js").click();
    // assert width of prorgress bar
    cy.get(".vjs-play-progress").invoke("width").should("gte", 0);
  });
});
```
