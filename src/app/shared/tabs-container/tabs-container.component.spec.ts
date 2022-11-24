import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { TabsContainerComponent } from './tabs-container.component';
import { TabComponent } from '../tab/tab.component';

@Component({
  template: ` <app-tabs-container>
    <app-tab tabTitle="Tab 1"></app-tab>
    <app-tab tabTitle="Tab 2"></app-tab>
  </app-tabs-container>`,
})
class TestHostComponent {}

describe('TabsContainerComponent', () => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have two tabs', () => {
    // via selecting component
    const tabs = fixture.debugElement.queryAll(By.css('li'));
    // via template props
    const containerComponent = fixture.debugElement.query(
      By.directive(TabsContainerComponent)
    );
    const tabsProp = containerComponent.componentInstance.tabs;

    expect(tabs.length).withContext('Tabs did not render').toBe(2);
    expect(tabsProp.length).toBe(2);
  });
});
