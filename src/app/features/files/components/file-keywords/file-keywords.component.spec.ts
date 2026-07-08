import { Store } from '@ngxs/store';

import { MockProvider } from 'ng-mocks';

import { Mock } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOnlyLinkHelperService } from '@osf/shared/services/view-only-link-helper.service';

import { FileDetailsMock } from '@testing/mocks/file-details.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { BaseSetupOverrides, mergeSignalOverrides, provideMockStore } from '@testing/providers/store-provider.mock';
import { ViewOnlyLinkHelperMock } from '@testing/providers/view-only-link-helper.mock';

import { FilesSelectors } from '../../store';
import { UpdateTags } from '../../store/files.actions';

import { FileKeywordsComponent } from './file-keywords.component';

describe('FileKeywordsComponent', () => {
  let component: FileKeywordsComponent;
  let fixture: ComponentFixture<FileKeywordsComponent>;
  let store: Store;

  const mockFile = FileDetailsMock.simple({
    guid: 'test-guid',
    name: 'test-file.txt',
  });

  const mockTags = ['tag1', 'tag2', 'tag3'];

  interface SetupOverrides extends BaseSetupOverrides {
    hasViewOnly?: boolean;
  }

  function setup(overrides: SetupOverrides = {}) {
    const viewOnlyServiceMock = ViewOnlyLinkHelperMock.simple(overrides.hasViewOnly ?? false);
    const defaultSignals = [
      { selector: FilesSelectors.getFileTags, value: mockTags },
      { selector: FilesSelectors.isFileTagsLoading, value: false },
      { selector: FilesSelectors.getOpenedFile, value: mockFile },
      { selector: FilesSelectors.hasWriteAccess, value: true },
    ];

    TestBed.configureTestingModule({
      imports: [FileKeywordsComponent],
      providers: [
        provideOSFCore(),
        MockProvider(ViewOnlyLinkHelperService, viewOnlyServiceMock),
        provideMockStore({ signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides) }),
      ],
    });

    fixture = TestBed.createComponent(FileKeywordsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();

    expect(component).toBeTruthy();
  });

  it('should expose tag edit permissions for editable state', () => {
    setup();

    expect(component.canManageTags()).toBe(true);
    expect(component.canEditTags()).toBe(true);
  });

  it('should disable editing when loading', () => {
    setup({
      selectorOverrides: [{ selector: FilesSelectors.isFileTagsLoading, value: true }],
    });

    expect(component.canEditTags()).toBe(false);
    expect(component.keywordControl.disabled).toBe(true);
  });

  it('should disable editing for view only mode', () => {
    setup({ hasViewOnly: true });

    expect(component.canManageTags()).toBe(false);
    expect(component.canEditTags()).toBe(false);
  });

  it('should dispatch update with trimmed tag on add', () => {
    setup();
    (store.dispatch as Mock).mockClear();
    component.keywordControl.setValue('  new-tag  ');

    component.addTag();

    expect(store.dispatch).toHaveBeenCalledWith(new UpdateTags(['tag1', 'tag2', 'tag3', 'new-tag'], 'test-guid'));
    expect(component.keywordControl.value).toBe('');
  });

  it('should not dispatch update when add input is invalid', () => {
    setup();
    (store.dispatch as Mock).mockClear();
    component.keywordControl.setValue('   ');

    component.addTag();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch update when removing existing tag', () => {
    setup();
    (store.dispatch as Mock).mockClear();

    component.deleteTag('tag2');

    expect(store.dispatch).toHaveBeenCalledWith(new UpdateTags(['tag1', 'tag3'], 'test-guid'));
    expect(component.keywordControl.value).toBe('');
  });

  it('should not dispatch update when tag is missing', () => {
    setup();
    (store.dispatch as Mock).mockClear();

    component.deleteTag('missing-tag');

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch update when cannot edit tags', () => {
    setup({
      selectorOverrides: [{ selector: FilesSelectors.hasWriteAccess, value: false }],
    });
    (store.dispatch as Mock).mockClear();

    component.deleteTag('tag1');

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch update when file guid is missing', () => {
    setup({
      selectorOverrides: [{ selector: FilesSelectors.getOpenedFile, value: null }],
    });
    (store.dispatch as Mock).mockClear();

    component.deleteTag('tag1');

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
