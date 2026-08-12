import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideOSFCore } from '@testing/osf.testing.provider';

import { WorkflowLauncherCard, WorkflowLauncherCardTheme } from '../../models/workflow-launcher-card.model';

import { WorkflowLauncherCardComponent } from './workflow-launcher-card.component';

describe('WorkflowLauncherCardComponent', () => {
  let component: WorkflowLauncherCardComponent;
  let fixture: ComponentFixture<WorkflowLauncherCardComponent>;

  const mockCard: WorkflowLauncherCard = {
    iconClass: 'custom-icon-registries',
    titleKey: 'home.loggedIn.dashboard.workflowLauncher.cards.studyPlans.title',
    descriptionKey: 'home.loggedIn.dashboard.workflowLauncher.cards.studyPlans.description',
    buttonLabelKey: 'home.loggedIn.dashboard.workflowLauncher.cards.studyPlans.button',
    theme: WorkflowLauncherCardTheme.Blue,
    routerLink: '/registries/osf/new',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WorkflowLauncherCardComponent],
      providers: [provideOSFCore(), provideRouter([])],
    });

    fixture = TestBed.createComponent(WorkflowLauncherCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('card', mockCard);
    expect(component).toBeTruthy();
  });

  it('should expose the card input value', () => {
    fixture.componentRef.setInput('card', mockCard);

    expect(component.card()).toEqual(mockCard);
  });

  it('should update the card input value', () => {
    fixture.componentRef.setInput('card', mockCard);

    const updatedCard: WorkflowLauncherCard = {
      iconClass: 'custom-icon-preprints',
      titleKey: 'home.loggedIn.dashboard.workflowLauncher.cards.preprints.title',
      descriptionKey: 'home.loggedIn.dashboard.workflowLauncher.cards.preprints.description',
      buttonLabelKey: 'home.loggedIn.dashboard.workflowLauncher.cards.preprints.button',
      theme: WorkflowLauncherCardTheme.TealGreen,
      routerLink: '/preprints/select',
    };

    fixture.componentRef.setInput('card', updatedCard);

    expect(component.card()).toEqual(updatedCard);
  });
});
