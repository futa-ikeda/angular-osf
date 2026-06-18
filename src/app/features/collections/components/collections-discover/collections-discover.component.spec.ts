import { MockComponents, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { UserSelectors } from '@osf/core/store/user/user.selectors';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SearchInputComponent } from '@osf/shared/components/search-input/search-input.component';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { CollectionsSelectors } from '@shared/stores/collections';

import { MOCK_PROVIDER } from '@testing/mocks/provider.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { CustomDialogServiceMockBuilder } from '@testing/providers/custom-dialog-provider.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { mergeSignalOverrides, provideMockStore } from '@testing/providers/store-provider.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';

import { CollectionsQuerySyncService } from '../../services';
import { CollectionsMainContentComponent } from '../collections-main-content/collections-main-content.component';

import { CollectionsDiscoverComponent } from './collections-discover.component';

describe('CollectionsDiscoverComponent', () => {
  let component: CollectionsDiscoverComponent;
  let fixture: ComponentFixture<CollectionsDiscoverComponent>;
  let toastServiceMock: ToastServiceMockType;
  let mockCustomDialogService: ReturnType<CustomDialogServiceMockBuilder['build']>;
  let mockRoute: ReturnType<ActivatedRouteMockBuilder['build']>;

  function setup(selectorOverrides?: any[]) {
    toastServiceMock = ToastServiceMock.simple();
    mockCustomDialogService = CustomDialogServiceMockBuilder.create().build();
    mockRoute = ActivatedRouteMockBuilder.create().withParams({ providerId: 'provider-1' }).build();

    const defaultSignals = [
      { selector: CollectionsSelectors.getCollectionProvider, value: MOCK_PROVIDER },
      { selector: CollectionsSelectors.getCollectionDetails, value: null },
      { selector: CollectionsSelectors.getAllSelectedFilters, value: {} },
      { selector: CollectionsSelectors.getSortBy, value: 'date' },
      { selector: CollectionsSelectors.getSearchText, value: '' },
      { selector: CollectionsSelectors.getPageNumber, value: '1' },
      { selector: CollectionsSelectors.getCollectionProviderLoading, value: false },
      { selector: UserSelectors.isProjectReadOnly, value: false },
    ];

    const signals = mergeSignalOverrides(defaultSignals, selectorOverrides);

    TestBed.configureTestingModule({
      imports: [
        CollectionsDiscoverComponent,
        ...MockComponents(SearchInputComponent, CollectionsMainContentComponent, LoadingSpinnerComponent),
      ],
      providers: [
        provideOSFCore(),
        MockProvider(ToastService, toastServiceMock),
        MockProvider(CustomDialogService, mockCustomDialogService),
        MockProvider(ActivatedRoute, mockRoute),
        provideMockStore({
          signals: signals,
        }),
      ],
    }).overrideComponent(CollectionsDiscoverComponent, {
      set: {
        providers: [MockProvider(CollectionsQuerySyncService)],
      },
    });

    fixture = TestBed.createComponent(CollectionsDiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    setup();
    expect(component.providerId()).toBe('provider-1');
    expect(component.searchControl.value).toBe('');
  });

  it('should handle search triggered', () => {
    setup();
    const searchValue = 'test search';

    component.onSearchTriggered(searchValue);

    expect(component).toBeTruthy();
  });

  it('should have provider id signal', () => {
    setup();
    expect(component.providerId()).toBe('provider-1');
  });

  it('should have collection provider data', () => {
    setup();
    expect(component.collectionProvider()).toEqual(MOCK_PROVIDER);
  });

  it('should have collection details', () => {
    setup();
    expect(component.collectionDetails()).toBeNull();
  });

  it('should have selected filters', () => {
    setup();
    expect(component.selectedFilters()).toEqual({});
  });

  it('should have sort by value', () => {
    setup();
    expect(component.sortBy()).toBe('date');
  });

  it('should have search text', () => {
    setup();
    expect(component.searchText()).toBe('');
  });

  it('should have page number', () => {
    setup();
    expect(component.pageNumber()).toBe('1');
  });

  it('should have loading state', () => {
    setup();
    expect(component.isProviderLoading()).toBe(false);
  });

  it('should compute primary collection id', () => {
    setup();
    expect(component.primaryCollectionId()).toBe(MOCK_PROVIDER.primaryCollection?.id);
  });

  it('should handle search control value changes', () => {
    setup();
    const searchValue = 'new search value';

    component.searchControl.setValue(searchValue);

    expect(component.searchControl.value).toBe(searchValue);
  });

  it('should disable add button when user has isProjectReadOnly', () => {
    setup([{ selector: UserSelectors.isProjectReadOnly, value: true }]);
    expect(component.disableAddButtonTooltip()).toBe('common.errorMessages.actionUnavailable');
  });
});
