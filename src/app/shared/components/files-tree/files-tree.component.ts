import { TranslatePipe } from '@ngx-translate/core';

import { PrimeTemplate, TreeDragDropService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Tree, TreeLazyLoadEvent } from 'primeng/tree';

import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';

import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileTreeMapper } from '@osf/shared/mappers/files/file-tree.mapper';
import { FilesMapper } from '@osf/shared/mappers/files/files.mapper';
import { FileMenuFlags } from '@osf/shared/models/files/file-menu-action.model';
import { FilePageLinkModel } from '@osf/shared/models/files/file-page-link.model';
import { FileModel } from '@shared/models/files/file.model';
import { FileFolderModel } from '@shared/models/files/file-folder.model';
import { FileLabelModel } from '@shared/models/files/file-label.model';

import { FilesDropZoneComponent } from '../files-drop-zone/files-drop-zone.component';
import { FilesTreeRowComponent } from '../files-tree-row/files-tree-row.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'osf-files-tree',
  imports: [
    Button,
    Tree,
    Tooltip,
    PrimeTemplate,
    LoadingSpinnerComponent,
    FilesDropZoneComponent,
    FilesTreeRowComponent,
    TranslatePipe,
  ],
  providers: [TreeDragDropService],
  templateUrl: './files-tree.component.html',
  styleUrl: './files-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesTreeComponent {
  readonly files = input.required<FileModel[]>();
  readonly currentFolder = input.required<FileFolderModel>();

  readonly totalCount = input<number>(0);
  readonly isLoading = input<boolean>(false);
  readonly storage = input<FileLabelModel | null>(null);
  readonly viewOnly = input<boolean>(true);
  readonly scrollHeight = input<string>('300px');
  readonly selectionMode = input<'multiple' | null>(null);
  readonly allowedMenuActions = input<FileMenuFlags>({} as FileMenuFlags);

  readonly fileOpened = output<FileModel>();
  readonly uploadFiles = output<File[] | File>();
  readonly currentFolderChanged = output<FileFolderModel>();
  readonly deleteFile = output<FileModel>();
  readonly loadFiles = output<FilePageLinkModel>();

  foldersStack = signal([] as FileFolderModel[]);
  isLoadingMore = signal(false);

  readonly itemsPerPage = 10;
  readonly virtualScrollItemSize = 46;

  readonly nodes = computed(() => {
    const currentFolder = this.currentFolder();
    const files = this.files();

    const values = this.foldersStack().length
      ? ([{ ...currentFolder, previousFolder: true }, ...files] as FileModel[])
      : files;

    return FileTreeMapper.toTreeNodes(values);
  });

  constructor() {
    effect(() => {
      const storageChanged = this.storage();
      if (storageChanged) {
        this.foldersStack.set([]);
      }
    });

    effect(() => {
      if (!this.isLoading()) {
        this.isLoadingMore.set(false);
      }
    });
  }

  onDropFiles(fileArray: File[]): void {
    this.uploadFiles.emit(fileArray);
  }

  deleteEntry(file: FileModel): void {
    this.deleteFile.emit(file);
  }

  openEntry(file: FileModel) {
    if (file.kind === FileKind.File) {
      this.fileOpened.emit(file);
    } else {
      const current = this.currentFolder();
      this.foldersStack.update((stack) => [...stack, current]);
      const folder = FilesMapper.mapFileToFolder(file);
      this.currentFolderChanged.emit(folder);
    }
  }

  openParentFolder() {
    const stack = this.foldersStack();
    const previous = stack[stack.length - 1];
    this.foldersStack.set(stack.slice(0, -1));
    this.currentFolderChanged.emit(previous);
  }

  onLazyLoad(event: TreeLazyLoadEvent) {
    const loaded = this.files().length;
    if (event.last >= loaded - 1) {
      this.loadNextPage();
    }
  }

  private loadNextPage(): void {
    const total = this.totalCount();
    const loaded = this.files().length;
    const nextPage = Math.floor(loaded / this.itemsPerPage) + 1;

    if (!this.isLoadingMore() && loaded < total) {
      this.isLoadingMore.set(true);
      this.loadFiles.emit({ link: this.currentFolder().links.filesLink, page: nextPage });
    }
  }
}
