import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Scroller } from 'primeng/scroller';
import { TreeScrollIndexChangeEvent } from 'primeng/tree';

import { finalize, tap } from 'rxjs';

import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SupportedFeature } from '@osf/shared/enums/addon-supported-features.enum';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { FilesMapper } from '@osf/shared/mappers/files/files.mapper';
import { FileModel } from '@osf/shared/models/files/file.model';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { CurrentResourceSelectors, GetResourceWithChildren } from '@osf/shared/stores/current-resource';

import { FileProvider } from '../../constants';
import { MoveCopyAction } from '../../enums/move-copy-action.enum';
import { FilesMoveCopyService } from '../../services/files-move-copy.service';
import { FilesSelectors, GetMoveDialogFiles, SetFilesCurrentFolder, SetMoveDialogCurrentFolder } from '../../store';
import { FileSelectDestinationComponent } from '../file-select-destination/file-select-destination.component';
import { MoveFileRowComponent } from '../move-file-row/move-file-row.component';

@Component({
  selector: 'osf-move-file-dialog',
  imports: [
    Button,
    Scroller,
    TranslatePipe,
    LoadingSpinnerComponent,
    FileSelectDestinationComponent,
    MoveFileRowComponent,
  ],
  templateUrl: './move-file-dialog.component.html',
  styleUrl: './move-file-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveFileDialogComponent {
  readonly config = inject(DynamicDialogConfig);
  readonly dialogRef = inject(DynamicDialogRef);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly filesMoveCopyService = inject(FilesMoveCopyService);

  readonly files = select(FilesSelectors.getMoveDialogFiles);
  readonly filesTotalCount = select(FilesSelectors.getMoveDialogFilesTotalCount);
  readonly isLoading = select(FilesSelectors.isMoveDialogFilesLoading);
  readonly currentFolder = select(FilesSelectors.getMoveDialogCurrentFolder);
  readonly currentProject = select(CurrentResourceSelectors.getCurrentResource);
  readonly components = select(CurrentResourceSelectors.getResourceWithChildren);
  readonly areComponentsLoading = select(CurrentResourceSelectors.isResourceWithChildrenLoading);
  readonly isConfiguredStorageAddonsLoading = select(FilesSelectors.isMoveDialogConfiguredStorageAddonsLoading);
  readonly isRootFoldersLoading = select(FilesSelectors.isMoveDialogRootFoldersLoading);
  readonly provider = select(FilesSelectors.getProvider);
  readonly supportedFeatures = select(FilesSelectors.getStorageSupportedFeatures);

  readonly actions = createDispatchMap({
    getMoveDialogFiles: GetMoveDialogFiles,
    setMoveDialogCurrentFolder: SetMoveDialogCurrentFolder,
    setCurrentFolder: SetFilesCurrentFolder,
    getComponentsTree: GetResourceWithChildren,
  });

  readonly isFilesUpdating = signal(false);

  foldersStack = signal<FileFolderModel[]>(this.config.data.foldersStack ?? []);
  storageProvider = signal<string>(this.config.data.storageProvider ?? FileProvider.OsfStorage);
  previousFolder = signal<FileFolderModel | null>(null);

  readonly isLoadingMore = signal(false);

  readonly itemsPerPage = 10;
  readonly virtualScrollItemSize = 44;

  private lastFolderId: string | null = null;
  private lastLoadedComponentsProjectId: string | null = null;
  private initialFolder = this.config.data.initialFolder;
  private fileProjectId = this.config.data.resourceId;

  readonly isMoveAction = this.config.data.action === MoveCopyAction.Move;

  readonly fileIdsInList = computed(() => new Set((this.config.data.files as FileModel[]).map((f) => f.id)));

  readonly isFolderSame = computed(() => this.currentFolder()?.id === this.initialFolder?.id);
  readonly isDestinationLoading = computed(
    () => this.isConfiguredStorageAddonsLoading() || this.areComponentsLoading() || this.isRootFoldersLoading()
  );

  readonly showFilesLoading = computed(
    () => this.isDestinationLoading() || ((this.isLoading() || this.isFilesUpdating()) && !this.isLoadingMore())
  );

  readonly hasAddUpdateFeature = computed(() => {
    const features = this.supportedFeatures()[this.provider()];
    return !!features && features.includes(SupportedFeature.AddUpdateFiles);
  });

  readonly buttonDisabled = computed(
    () =>
      this.isLoading() ||
      this.isFilesUpdating() ||
      this.isFolderSame() ||
      this.isDestinationLoading() ||
      !this.hasAddUpdateFeature()
  );

  constructor() {
    this.initPreviousFolder();
    this.setupComponentsTreeLoader();
    this.setupMoveDialogFilesLoader();
    this.setupLoadingMoreReset();
  }

  initPreviousFolder() {
    const stack = this.foldersStack();
    this.previousFolder.set(stack.at(-1) ?? null);
  }

  openFolder(file: FileModel) {
    if (file.kind === FileKind.Folder) {
      const current = this.currentFolder();
      if (current) {
        this.previousFolder.set(current);
        this.foldersStack.update((stack) => [...stack, current]);
      }
      const folder = FilesMapper.mapFileToFolder(file);
      this.actions.setMoveDialogCurrentFolder(folder);
    }
  }

  openParentFolder() {
    this.foldersStack.update((stack) => {
      const newStack = [...stack];
      const previous = newStack.pop() ?? null;
      this.previousFolder.set(newStack.length > 0 ? newStack[newStack.length - 1] : null);

      if (previous) {
        this.actions.setMoveDialogCurrentFolder(previous);
      }
      return newStack;
    });
  }

  onScrollIndexChange(event: TreeScrollIndexChangeEvent) {
    const loaded = this.files().length;
    if (event.last >= loaded - 1) {
      this.loadNextPage();
    }
  }

  onProjectChange(projectId: string) {
    this.fileProjectId = projectId;
    this.foldersStack.set([]);
    this.previousFolder.set(null);
  }

  onStorageChange() {
    this.foldersStack.set([]);
    this.previousFolder.set(null);
  }

  moveFiles(): void {
    this.isFilesUpdating.set(true);
    const headerKey = this.isMoveAction ? 'files.dialogs.moveFile.movingHeader' : 'files.dialogs.moveFile.copingHeader';
    this.config.header = this.translateService.instant(headerKey);
    const action = this.config.data.action as MoveCopyAction;
    this.filesMoveCopyService
      .execute({
        files: this.config.data.files,
        destination: this.currentFolder(),
        resourceId: this.fileProjectId,
        storageProvider: this.provider(),
        action,
      })
      .pipe(
        tap(() => this.completeMove()),
        finalize(() => {
          this.config.header = this.translateService.instant('files.dialogs.moveFile.title');
          this.isFilesUpdating.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private completeMove(): void {
    this.actions.setCurrentFolder(this.initialFolder);
    this.actions.setMoveDialogCurrentFolder(null);
    this.dialogRef.close(true);
  }

  private setupComponentsTreeLoader(): void {
    effect(() => {
      const currentProject = this.currentProject();
      if (!currentProject || currentProject.id === this.lastLoadedComponentsProjectId) {
        return;
      }

      this.lastLoadedComponentsProjectId = currentProject.id;
      const rootParentId = currentProject.rootResourceId ?? currentProject.id;
      this.actions.getComponentsTree(rootParentId, currentProject.id, ResourceType.Project, true);
    });
  }

  private setupMoveDialogFilesLoader(): void {
    effect(() => {
      const folder = this.currentFolder();
      const isLoading = this.isDestinationLoading();

      if (isLoading) {
        return;
      }

      if (!folder || folder.id === this.lastFolderId) {
        return;
      }

      this.lastFolderId = folder.id;
      this.actions.getMoveDialogFiles(folder.links.filesLink, 1);
    });
  }

  private setupLoadingMoreReset(): void {
    effect(() => {
      if (!this.isLoading()) {
        this.isLoadingMore.set(false);
      }
    });
  }

  private loadNextPage(): void {
    const total = this.filesTotalCount();
    const loaded = this.files().length;
    const nextPage = Math.floor(loaded / this.itemsPerPage) + 1;
    const filesLink = this.currentFolder()?.links.filesLink;

    if (!this.isLoadingMore() && loaded < total && filesLink) {
      this.isLoadingMore.set(true);
      this.actions.getMoveDialogFiles(filesLink, nextPage);
    }
  }
}
