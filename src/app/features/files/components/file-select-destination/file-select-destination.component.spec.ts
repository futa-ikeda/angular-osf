import { Store } from '@ngxs/store';

import { MockComponent } from 'ng-mocks';

import { Mock } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectComponent } from '@osf/shared/components/select/select.component';
import { SupportedFeature } from '@osf/shared/enums/addon-supported-features.enum';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { NodeShortInfoModel } from '@osf/shared/models/nodes/node-with-children.model';

import { MOCK_CONFIGURED_ADDON } from '@testing/mocks/configured-addon.mock';
import { OSF_FILE_MOCK } from '@testing/mocks/osf-file.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';

import { FileProvider } from '../../constants/file-provider.constants';
import {
  FilesSelectors,
  GetMoveDialogConfiguredStorageAddons,
  GetMoveDialogRootFolders,
  GetStorageSupportedFeatures,
} from '../../store';

import { FileSelectDestinationComponent } from './file-select-destination.component';

interface SetupOverrides extends BaseSetupOverrides {
  projectId?: string;
  storageProvider?: string;
  components?: NodeShortInfoModel[];
  areComponentsLoading?: boolean;
}

describe('FileSelectDestinationComponent', () => {
  let component: FileSelectDestinationComponent;
  let fixture: ComponentFixture<FileSelectDestinationComponent>;
  let store: Store;

  const rootFolder: FileFolderModel = {
    ...OSF_FILE_MOCK,
    id: 'root-1',
    name: 'OSF Storage',
    provider: FileProvider.OsfStorage,
  };

  const components: NodeShortInfoModel[] = [
    { id: 'project-1', title: 'Project 1', isPublic: true, permissions: [UserPermissions.Write] },
    {
      id: 'component-1',
      title: 'Component 1',
      isPublic: true,
      permissions: [UserPermissions.Write],
      parentId: 'project-1',
    },
    { id: 'readonly-1', title: 'Readonly', isPublic: true, permissions: [UserPermissions.Read], parentId: 'project-1' },
  ];

  function setup(overrides: SetupOverrides = {}) {
    const defaultSignals: SignalOverride[] = [
      { selector: FilesSelectors.getMoveDialogRootFolders, value: [rootFolder] },
      { selector: FilesSelectors.isMoveDialogRootFoldersLoading, value: false },
      {
        selector: FilesSelectors.getMoveDialogConfiguredStorageAddons,
        value: [{ ...MOCK_CONFIGURED_ADDON, id: 'addon-1', externalServiceName: FileProvider.OsfStorage }],
      },
      { selector: FilesSelectors.isMoveDialogConfiguredStorageAddonsLoading, value: false },
      { selector: FilesSelectors.isMoveDialogFilesLoading, value: false },
      {
        selector: FilesSelectors.getStorageSupportedFeatures,
        value: { [FileProvider.OsfStorage]: [SupportedFeature.AddUpdateFiles] },
      },
    ];

    TestBed.configureTestingModule({
      imports: [FileSelectDestinationComponent, MockComponent(SelectComponent)],
      providers: [
        provideOSFCore(),
        provideMockStore({ signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides) }),
      ],
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(FileSelectDestinationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('projectId', overrides.projectId ?? 'project-1');
    fixture.componentRef.setInput('storageProvider', overrides.storageProvider ?? FileProvider.OsfStorage);
    fixture.componentRef.setInput('components', overrides.components ?? components);
    fixture.componentRef.setInput('areComponentsLoading', overrides.areComponentsLoading ?? false);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should load storage addons on init and request supported features', () => {
    setup();
    const calls = (store.dispatch as Mock).mock.calls.map((c) => c[0]);

    expect(calls).toContainEqual(new GetMoveDialogRootFolders('project-1', ResourceType.Project));
    expect(calls).toContainEqual(new GetMoveDialogConfiguredStorageAddons('project-1'));
    expect(calls).toContainEqual(new GetStorageSupportedFeatures('addon-1', FileProvider.OsfStorage));
  });

  it('should emit project selection and reload storage addons on project change', () => {
    setup();
    const emitSpy = vi.spyOn(component.selectProject, 'emit');
    (store.dispatch as Mock).mockClear();

    component.onChangeProject('project-2');

    expect(emitSpy).toHaveBeenCalledWith('project-2');
    expect(store.dispatch).toHaveBeenCalledWith(new GetMoveDialogRootFolders('project-2', ResourceType.Project));
    expect(store.dispatch).toHaveBeenCalledWith(new GetMoveDialogConfiguredStorageAddons('project-2'));
  });

  it('should update current root folder and emit storage selection on storage change', () => {
    setup();
    const emitSpy = vi.spyOn(component.selectStorage, 'emit');

    component.onStorageChange('root-1');

    expect(component.currentRootFolder()?.folder.id).toBe('root-1');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should include only write-access nodes in options', () => {
    setup();
    const values = component.options().map((o) => o.value);

    expect(values).toContain('project-1');
    expect(values).toContain('component-1');
    expect(values).not.toContain('readonly-1');
  });

  it('should detect add update feature by provider', () => {
    setup();

    expect(component.hasAddUpdateFeature(FileProvider.OsfStorage)).toBe(true);
    expect(component.hasAddUpdateFeature('dropbox')).toBe(false);
  });

  it('should expose loading state when component loading is true', () => {
    setup({ areComponentsLoading: true });

    expect(component.isLoading()).toBe(true);
  });
});
