import { MockComponents } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { IconComponent } from '@osf/shared/components/icon/icon.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

import { WORKFLOW_LAUNCHER_CARDS } from '../../constants/workflow-launcher.constants';

import { WorkflowLauncherSectionComponent } from './workflow-launcher-section.component';

describe('WorkflowLauncherSectionComponent', () => {
  let fixture: ComponentFixture<WorkflowLauncherSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WorkflowLauncherSectionComponent, ...MockComponents(IconComponent)],
      providers: [provideOSFCore(), provideRouter([])],
    });

    fixture = TestBed.createComponent(WorkflowLauncherSectionComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose workflow launcher cards from constants', () => {
    expect(fixture.componentInstance.cards).toEqual(WORKFLOW_LAUNCHER_CARDS);
  });

  it('should render the workflow launcher intro copy', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const intro = fixture.nativeElement.querySelector('section.workflow-launcher > .flex.flex-column');
    const heading = intro?.querySelector('h1');
    const descriptions = intro?.querySelectorAll('p');

    expect(heading?.textContent?.trim()).toBe('home.loggedIn.dashboard.workflowLauncher.title');
    expect(descriptions?.length).toBe(2);
    expect(descriptions?.[0]?.textContent?.trim()).toBe('home.loggedIn.dashboard.workflowLauncher.description1');
    expect(descriptions?.[1]?.textContent?.trim()).toBe('home.loggedIn.dashboard.workflowLauncher.description2');
  });

  it('should render a card for each workflow launcher entry', () => {
    const cards = fixture.nativeElement.querySelectorAll('osf-workflow-launcher-card');

    expect(cards.length).toBe(WORKFLOW_LAUNCHER_CARDS.length);
  });
});
