import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { NavComponent } from './nav.component';
import { AuthService } from '../services/auth.service';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  const mockAuthService = jasmine.createSpyObj(
    'AuthService',
    ['createUser', 'logout'],
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

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to click logout button', () => {
    const logoutLink = fixture.debugElement.query(By.css('li:nth-child(3) a'));
    expect(logoutLink).withContext('User is not logged in').toBeTruthy();

    logoutLink.triggerEventHandler('click');
    // verify logout function was called
    const service = TestBed.inject(AuthService);
    expect(service.logout)
      .withContext('Could not click logout link')
      .toHaveBeenCalledTimes(1);
  });
});
