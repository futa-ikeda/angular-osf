import { MockComponents, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UserSelectors } from '@core/store/user';
import { CollectionMetadataStepComponent } from '@osf/features/collections/components/add-to-collection/collection-metadata-step/collection-metadata-step.component';
import { ProjectContributorsStepComponent } from '@osf/features/collections/components/add-to-collection/project-contributors-step/project-contributors-step.component';
import { ProjectMetadataStepComponent } from '@osf/features/collections/components/add-to-collection/project-metadata-step/project-metadata-step.component';
import { SelectProjectStepComponent } from '@osf/features/collections/components/add-to-collection/select-project-step/select-project-step.component';
import { AddToCollectionSteps } from '@osf/features/collections/enums';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { CollectionsSelectors } from '@shared/stores/collections';
import { ProjectsSelectors } from '@shared/stores/projects/projects.selectors';

import { MOCK_USER } from '@testing/mocks/data.mock';
import { MOCK_PROJECT } from '@testing/mocks/project.mock';
import { MOCK_PROVIDER } from '@testing/mocks/provider.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { CustomDialogServiceMockBuilder } from '@testing/providers/custom-dialog-provider.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder } from '@testing/providers/router-provider.mock';
import { mergeSignalOverrides, provideMockStore } from '@testing/providers/store-provider.mock';

import { AddToCollectionComponent } from './add-to-collection.component';

describe('AddToCollectionComponent', () => {
  let component: AddToCollectionComponent;
  let fixture: ComponentFixture<AddToCollectionComponent>;
  let mockRouter: ReturnType<RouterMockBuilder['build']>;
  let mockActivatedRoute: ReturnType<ActivatedRouteMockBuilder['build']>;
  let mockCustomDialogService: ReturnType<CustomDialogServiceMockBuilder['build']>;

  const mockCollectionProvider = MOCK_PROVIDER;

  function setup(selectorOverrides?: any[]) {
    mockRouter = RouterMockBuilder.create().build();
    mockActivatedRoute = ActivatedRouteMockBuilder.create().withParams({ id: null }).build();
    mockCustomDialogService = CustomDialogServiceMockBuilder.create().build();
    const defaultSignals = [
      { selector: CollectionsSelectors.getCollectionProviderLoading, value: false },
      { selector: CollectionsSelectors.getCollectionProvider, value: mockCollectionProvider },
      { selector: ProjectsSelectors.getSelectedProject, value: MOCK_PROJECT },
      { selector: UserSelectors.getCurrentUser, value: MOCK_USER },
      { selector: UserSelectors.isProjectReadOnly, value: false },
    ];

    const signals = mergeSignalOverrides(defaultSignals, selectorOverrides);

    TestBed.configureTestingModule({
      imports: [
        AddToCollectionComponent,
        ...MockComponents(
          LoadingSpinnerComponent,
          SelectProjectStepComponent,
          ProjectMetadataStepComponent,
          ProjectContributorsStepComponent,
          CollectionMetadataStepComponent
        ),
      ],
      providers: [
        provideOSFCore(),
        MockProvider(ActivatedRoute, mockActivatedRoute),
        MockProvider(Router, mockRouter),
        MockProvider(CustomDialogService, mockCustomDialogService),
        MockProvider(ToastService),
        provideMockStore({
          signals: signals,
        }),
      ],
    });

    fixture = TestBed.createComponent(AddToCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    setup();
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.SelectProject);
    expect(component.projectMetadataSaved()).toBe(false);
    expect(component.projectContributorsSaved()).toBe(false);
    expect(component.collectionMetadataSaved()).toBe(false);
    expect(component.allowNavigation()).toBe(false);
  });

  it('should handle project selection', () => {
    setup();
    component.handleProjectSelected();

    expect(component.projectContributorsSaved()).toBe(false);
    expect(component.projectMetadataSaved()).toBe(false);
    expect(component.allowNavigation()).toBe(false);
  });

  it('should handle step change', () => {
    setup();
    const newStep = AddToCollectionSteps.ProjectMetadata;
    component.handleChangeStep(newStep);

    expect(component.stepperActiveValue()).toBe(newStep);
  });

  it('should handle project metadata saved', () => {
    setup();
    component.handleProjectMetadataSaved();

    expect(component.projectMetadataSaved()).toBe(true);
  });

  it('should handle contributors saved', () => {
    setup();
    component.handleContributorsSaved();

    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.CollectionMetadata);
    expect(component.projectContributorsSaved()).toBe(true);
  });

  it('should handle collection metadata saved', () => {
    setup();
    const mockForm = new FormGroup({});
    component.handleCollectionMetadataSaved(mockForm);

    expect(component.collectionMetadataForm).toBe(mockForm);
    expect(component.collectionMetadataSaved()).toBe(true);
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.Complete);
  });

  it('should have actions defined', () => {
    setup();
    expect(component.actions).toBeDefined();
    expect(component.actions.getCollectionProvider).toBeDefined();
    expect(component.actions.clearAddToCollectionState).toBeDefined();
  });

  it('should handle loading state', () => {
    setup();
    expect(component.isProviderLoading()).toBe(false);
  });

  it('should have collection provider data', () => {
    setup();
    expect(component.collectionProvider()).toEqual(mockCollectionProvider);
  });

  it('should have selected project data', () => {
    setup();
    expect(component.selectedProject()).toEqual(MOCK_PROJECT);
  });

  it('should have current user data', () => {
    setup();
    expect(component.currentUser()).toEqual(MOCK_USER);
  });

  it('should disable the add to collection button if isProjectReadOnly', () => {
    setup([{ selector: UserSelectors.isProjectReadOnly, value: true }]);
    expect(component.disabledAddButtonTooltip()).toBe('common.errorMessages.actionUnavailable');
  });
});
