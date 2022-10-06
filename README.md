# Gank

## Tailwind Installation

Tailwind is a CSS framework that focuses on utility-first approach. Angular officially supports tailwind. We first need to install the tailwind package using `npm install -D tailwindcss`

We then create the configuration file using `npx tailwind init`. This creates a tailwind.config.js file in the root. We use the following config. The theme option contains properties for modifying colors, font sizes etc.

```js
module.exports = {
  content: ["./src/app/**/*.{html,js}"],
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
