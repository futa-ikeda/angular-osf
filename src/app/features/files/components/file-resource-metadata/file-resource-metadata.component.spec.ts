import { MockComponent, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ContributorsListComponent } from '@osf/shared/components/contributors-list/contributors-list.component';
import { ResourceMetadata } from '@osf/shared/models/resource-metadata.model';
import { ViewOnlyLinkHelperService } from '@osf/shared/services/view-only-link-helper.service';

import { MOCK_CONTRIBUTOR, MOCK_CONTRIBUTOR_WITHOUT_HISTORY } from '@testing/mocks/contributors.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';
import { BaseSetupOverrides, mergeSignalOverrides, provideMockStore } from '@testing/providers/store-provider.mock';
import { ViewOnlyLinkHelperMock, ViewOnlyLinkHelperMockType } from '@testing/providers/view-only-link-helper.mock';

import { FilesSelectors } from '../../store';

import { FileResourceMetadataComponent } from './file-resource-metadata.component';

interface SetupOverrides extends BaseSetupOverrides {
  hasViewOnly?: boolean;
}

describe('FileResourceMetadataComponent', () => {
  let component: FileResourceMetadataComponent;
  let fixture: ComponentFixture<FileResourceMetadataComponent>;
  let mockRouter: RouterMockType;
  let viewOnlyService: ViewOnlyLinkHelperMockType;

  const mockResourceMetadata: ResourceMetadata = {
    title: 'Test Resource',
    description: 'Test Description',
    dateCreated: new Date('2023-01-01'),
    dateModified: new Date('2023-01-02'),
    language: 'en',
    resourceTypeGeneral: 'Dataset',
    identifiers: [],
    funders: [],
  };

  const mockContributors = [MOCK_CONTRIBUTOR, MOCK_CONTRIBUTOR_WITHOUT_HISTORY];

  const defaultSignals = [
    { selector: FilesSelectors.getResourceMetadata, value: mockResourceMetadata },
    { selector: FilesSelectors.getContributors, value: mockContributors },
    { selector: FilesSelectors.isResourceMetadataLoading, value: false },
    { selector: FilesSelectors.isResourceContributorsLoading, value: false },
  ];

  function setup(overrides: SetupOverrides = {}): void {
    mockRouter = RouterMockBuilder.create().withUrl('/test').build();
    viewOnlyService = ViewOnlyLinkHelperMock.simple(overrides.hasViewOnly ?? false);

    TestBed.configureTestingModule({
      imports: [FileResourceMetadataComponent, MockComponent(ContributorsListComponent)],
      providers: [
        provideOSFCore(),
        MockProvider(Router, mockRouter),
        MockProvider(ViewOnlyLinkHelperService, viewOnlyService),
        provideMockStore({ signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides) }),
      ],
    });

    fixture = TestBed.createComponent(FileResourceMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();

    expect(component).toBeTruthy();
  });

  it('should have default resource type', () => {
    setup();

    expect(component.resourceType()).toBe('nodes');
  });

  it('should get resource metadata from store', () => {
    setup();

    expect(component.resourceMetadata()).toEqual(mockResourceMetadata);
  });

  it('should get contributors from store', () => {
    setup();

    expect(component.contributors()).toEqual(mockContributors);
  });

  it('should expose loading states from store selectors', () => {
    setup({
      selectorOverrides: [
        { selector: FilesSelectors.isResourceMetadataLoading, value: true },
        { selector: FilesSelectors.isResourceContributorsLoading, value: true },
      ],
    });

    expect(component.isResourceMetadataLoading()).toBe(true);
    expect(component.isResourceContributorsLoading()).toBe(true);
  });

  it('should set hasViewOnly based on helper service', () => {
    setup({ hasViewOnly: true });

    expect(component.hasViewOnly).toBe(true);
    expect(viewOnlyService.hasViewOnlyParam).toHaveBeenCalled();
    expect(viewOnlyService.hasViewOnlyParam).toHaveBeenCalledWith(expect.objectContaining({ url: '/test' }));
  });

  it('should handle input changes', () => {
    setup();

    fixture.componentRef.setInput('resourceType', 'preprints');
    fixture.detectChanges();

    expect(component.resourceType()).toBe('preprints');
  });

  it('should support missing metadata and empty contributors', () => {
    setup({
      selectorOverrides: [
        { selector: FilesSelectors.getResourceMetadata, value: null },
        { selector: FilesSelectors.getContributors, value: [] },
      ],
    });

    expect(component.resourceMetadata()).toBeNull();
    expect(component.contributors()).toEqual([]);
  });
});
