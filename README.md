# Gank

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

### Form Submission

The form submission is handled using a custom event emitted by the FormGroup object. Angular provides the **(ngSubmit)** custom event for listening to submission events.

```html
<form [formGroup]="registerForm" (ngSubmit)="register()"></form>
```
