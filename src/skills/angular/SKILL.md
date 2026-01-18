---
name: Angular Web Development
description: Build robust Angular apps with modular architecture, DI, RxJS, NgRx, testing, and performance tuning
---

# Angular Skill

Patterns and guidance for scalable Angular applications.

## Architecture

- **Modules/Standalone**: Prefer standalone components in newer Angular or feature modules when needed.
- **Feature Folders**: `app/features/<feature>/components|services|store`.
- **Shared**: `app/shared/ui`, `app/shared/utils`, `app/shared/directives`.
- **Providers**: Provide services at root or feature scope appropriately.

## Dependency Injection & Services

```ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}
  getById(id: string) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

## RxJS Essentials

- Use `Observable` streams, `pipe`, and operators; avoid manual subscription when possible.
- **AsyncPipe** to render streams in templates, auto-unsubscribe.

```ts
user$ = this.userService.getById("123");
```

```html
<div *ngIf="user$ | async as user">{{ user.name }}</div>
```

## State Management (NgRx)

```ts
// store/user.actions.ts
import { createAction, props } from "@ngrx/store";
export const loadUser = createAction("[User] Load", props<{ id: string }>());
export const loadUserSuccess = createAction(
  "[User] Load Success",
  props<{ user: User }>(),
);
export const loadUserFailure = createAction(
  "[User] Load Failure",
  props<{ error: string }>(),
);
```

```ts
// store/user.reducer.ts
import { createReducer, on } from "@ngrx/store";
import * as UserActions from "./user.actions";

export interface State {
  user: User | null;
  loading: boolean;
  error: string | null;
}
export const initialState: State = { user: null, loading: false, error: null };

export const reducer = createReducer(
  initialState,
  on(UserActions.loadUser, (s) => ({ ...s, loading: true })),
  on(UserActions.loadUserSuccess, (s, { user }) => ({
    ...s,
    loading: false,
    user,
  })),
  on(UserActions.loadUserFailure, (s, { error }) => ({
    ...s,
    loading: false,
    error,
  })),
);
```

```ts
// store/user.effects.ts
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { inject } from "@angular/core";
import { exhaustMap, map, catchError, of } from "rxjs";
import * as UserActions from "./user.actions";
import { UserService } from "../services/user.service";

export const loadUserEffect = createEffect(
  (actions$ = inject(Actions), userService = inject(UserService)) =>
    actions$.pipe(
      ofType(UserActions.loadUser),
      exhaustMap(({ id }) =>
        userService.getById(id).pipe(
          map((user) => UserActions.loadUserSuccess({ user })),
          catchError((err) =>
            of(UserActions.loadUserFailure({ error: err.message })),
          ),
        ),
      ),
    ),
);
```

## Forms

- **Reactive Forms** preferred for complex validation.

```ts
form = new FormGroup({
  email: new FormControl("", [Validators.required, Validators.email]),
});
```

```html
<form [formGroup]="form">
  <input formControlName="email" />
  <div *ngIf="form.controls.email.invalid && form.controls.email.touched">
    Invalid email
  </div>
</form>
```

## Change Detection

- Use `ChangeDetectionStrategy.OnPush` to optimize.
- Provide immutable inputs and pure pipes.

```ts
@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  @Input() user!: User;
}
```

## Accessibility

- Semantics first, ARIA only when needed.
- Keyboard navigation and focus management.
- Use CDK components for accessible foundations.

## Performance

- Lazy load feature routes.
- Preload critical modules.
- Avoid heavy pipes or complex templates; move logic to TS.
- TrackBy in `*ngFor` for stable identity.

```html
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>
```

```ts
trackById(_: number, item: { id: string }) { return item.id; }
```

## Testing

- **Unit**: Test components with `TestBed`.
- **Effects/Reducers**: Test NgRx logic isolated.
- **Integration/E2E**: Cypress/Playwright for flows.

```ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UserComponent } from "./user.component";

describe("UserComponent", () => {
  let fixture: ComponentFixture<UserComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UserComponent);
    fixture.componentInstance.user = { id: "1", name: "A" } as any;
    fixture.detectChanges();
  });
  it("renders name", () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain("A");
  });
});
```

## Do's & Don'ts

**Do:**

- Leverage RxJS for async flows.
- Prefer OnPush and pure data flows.
- Encapsulate business logic in services.

**Don't:**

- Overuse `any` types.
- Heavy logic in templates.
- Global mutable singletons.

## Resources

- Angular Docs — https://angular.io/
- NgRx — https://ngrx.io/
- Angular CDK — https://material.angular.io/cdk/categories
