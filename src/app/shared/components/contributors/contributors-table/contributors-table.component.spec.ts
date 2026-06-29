import { MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectors } from '@osf/core/store/user/user.selectors';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { ContributorModel } from '@shared/models/contributors/contributor.model';
import { TableParameters } from '@shared/models/table-parameters.model';
import { CustomDialogService } from '@shared/services/custom-dialog.service';

import { MOCK_CONTRIBUTOR, MOCK_CONTRIBUTOR_WITHOUT_HISTORY } from '@testing/mocks/contributors.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { CustomDialogServiceMockBuilder } from '@testing/providers/custom-dialog-provider.mock';
import { BaseSetupOverrides, mergeSignalOverrides, provideMockStore } from '@testing/providers/store-provider.mock';

import { EducationHistoryDialogComponent } from '../../education-history-dialog/education-history-dialog.component';
import { EmploymentHistoryDialogComponent } from '../../employment-history-dialog/employment-history-dialog.component';

import { ContributorsTableComponent } from './contributors-table.component';

describe('ContributorsTableComponent', () => {
  let component: ContributorsTableComponent;
  let fixture: ComponentFixture<ContributorsTableComponent>;
  let mockCustomDialogService: ReturnType<CustomDialogServiceMockBuilder['build']>;

  const tableParams: TableParameters = {
    rows: 10,
    paginator: true,
    scrollable: false,
    rowsPerPageOptions: [10, 25, 50],
    totalRecords: 4,
    firstRowIndex: 10,
    defaultSortOrder: null,
    defaultSortColumn: null,
  };

  function setup(overrides: BaseSetupOverrides = {}) {
    mockCustomDialogService = CustomDialogServiceMockBuilder.create().build();
    const defaultSignals = [{ selector: UserSelectors.isProjectReadOnly, value: false }];
    const signals = mergeSignalOverrides(defaultSignals, overrides.selectorOverrides);

    TestBed.configureTestingModule({
      imports: [ContributorsTableComponent],
      providers: [
        provideOSFCore(),
        MockProvider(CustomDialogService, mockCustomDialogService),
        provideMockStore({ signals }),
      ],
    });

    fixture = TestBed.createComponent(ContributorsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tableParams', tableParams);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should compute isProject based on resourceType', () => {
    setup();
    fixture.componentRef.setInput('resourceType', ResourceType.Project);
    fixture.detectChanges();
    expect(component.isProject()).toBe(true);

    fixture.componentRef.setInput('resourceType', ResourceType.Registration);
    fixture.detectChanges();
    expect(component.isProject()).toBe(false);
  });

  it('should compute deactivatedContributors when list contains deactivated contributor', () => {
    setup();
    const contributors: ContributorModel[] = [
      { ...MOCK_CONTRIBUTOR, id: '1', deactivated: false },
      { ...MOCK_CONTRIBUTOR_WITHOUT_HISTORY, id: '2', deactivated: true },
    ];

    component.contributors.set(contributors);

    expect(component.deactivatedContributors()).toBe(true);
  });

  it('should compute showLoadMore when loaded contributors are below total records', () => {
    setup();
    component.contributors.set([{ ...MOCK_CONTRIBUTOR, id: '1' }]);

    expect(component.showLoadMore()).toBe(true);
  });

  it('should compute showLoadMore as false when contributors length matches total records', () => {
    setup();
    const contributors: ContributorModel[] = [
      { ...MOCK_CONTRIBUTOR, id: '1' },
      { ...MOCK_CONTRIBUTOR_WITHOUT_HISTORY, id: '2' },
      { ...MOCK_CONTRIBUTOR, id: '3' },
      { ...MOCK_CONTRIBUTOR_WITHOUT_HISTORY, id: '4' },
    ];
    component.contributors.set(contributors);

    expect(component.showLoadMore()).toBe(false);
  });

  it('should compute properties when hasAdminAccess is true and isProjectReadonly is false', () => {
    setup({ selectorOverrides: [{ selector: UserSelectors.isProjectReadOnly, value: false }] });
    fixture.componentRef.setInput('hasAdminAccess', true);
    fixture.detectChanges();
    expect(component.canEditContributors()).toBe(true);
    expect(component.controlDisabledTooltip()).toBe('');
  });

  it('should compute properties when hasAdminAccess is true and isProjectReadonly is true', () => {
    setup({ selectorOverrides: [{ selector: UserSelectors.isProjectReadOnly, value: true }] });
    fixture.componentRef.setInput('hasAdminAccess', true);
    fixture.detectChanges();
    expect(component.canEditContributors()).toBe(false);
    expect(component.controlDisabledTooltip()).toBe('common.errorMessages.actionUnavailable');
  });

  it('should compute properties when hasAdminAccess is false and isProjectReadonly is false', () => {
    setup({ selectorOverrides: [{ selector: UserSelectors.isProjectReadOnly, value: false }] });
    fixture.componentRef.setInput('hasAdminAccess', false);
    fixture.detectChanges();
    expect(component.canEditContributors()).toBe(false);
    expect(component.controlDisabledTooltip()).toBe('');
  });

  it('should compute properties when hasAdminAccess is true, isProjectReadonly is true, and isProject is false', () => {
    setup({ selectorOverrides: [{ selector: UserSelectors.isProjectReadOnly, value: true }] });
    fixture.componentRef.setInput('hasAdminAccess', true);
    fixture.componentRef.setInput('resourceType', ResourceType.DraftRegistration);
    fixture.detectChanges();
    expect(component.canEditContributors()).toBe(true);
    expect(component.controlDisabledTooltip()).toBe('');
  });

  it('should emit remove event when removeContributor is called', () => {
    setup();
    const contributor = { ...MOCK_CONTRIBUTOR, id: 'remove-id' };
    vi.spyOn(component.remove, 'emit');

    component.removeContributor(contributor);

    expect(component.remove.emit).toHaveBeenCalledWith(contributor);
  });

  it('should emit loadMore event when loadMoreItems is called', () => {
    setup();
    vi.spyOn(component.loadMore, 'emit');

    component.loadMoreItems();

    expect(component.loadMore.emit).toHaveBeenCalled();
  });

  it('should open education history dialog with contributor education data', () => {
    setup();
    const contributor: ContributorModel = {
      ...MOCK_CONTRIBUTOR,
      id: 'education-id',
      education: [
        {
          institution: 'University',
          department: 'Physics',
          degree: 'MSc',
          startMonth: 9,
          startYear: 2018,
          endMonth: 6,
          endYear: 2020,
          ongoing: false,
        },
      ],
    };

    component.openEducationHistory(contributor);

    expect(mockCustomDialogService.open).toHaveBeenCalledWith(EducationHistoryDialogComponent, {
      header: 'project.contributors.table.headers.education',
      width: '552px',
      data: contributor.education,
    });
  });

  it('should open employment history dialog with contributor employment data', () => {
    setup();
    const contributor: ContributorModel = {
      ...MOCK_CONTRIBUTOR,
      id: 'employment-id',
      employment: [
        {
          institution: 'Company',
          department: 'Engineering',
          title: 'Developer',
          startMonth: 1,
          startYear: 2021,
          endMonth: null,
          endYear: null,
          ongoing: true,
        },
      ],
    };

    component.openEmploymentHistory(contributor);

    expect(mockCustomDialogService.open).toHaveBeenCalledWith(EmploymentHistoryDialogComponent, {
      header: 'project.contributors.table.headers.employment',
      width: '552px',
      data: contributor.employment,
    });
  });

  it('should reorder contributors indices using table firstRowIndex', () => {
    setup();
    const contributors: ContributorModel[] = [
      { ...MOCK_CONTRIBUTOR, id: '1', index: 0 },
      { ...MOCK_CONTRIBUTOR_WITHOUT_HISTORY, id: '2', index: 1 },
      { ...MOCK_CONTRIBUTOR, id: '3', index: 2 },
    ];
    component.contributors.set(contributors);

    component.onRowReorder();

    expect(component.contributors().map((item) => item.index)).toEqual([10, 11, 12]);
  });
});
