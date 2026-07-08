import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, TemplateRef } from '@angular/core';

import { StopPropagationDirective } from '@osf/shared/directives/stop-propagation.directive';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileModel } from '@shared/models/files/file.model';
import { FileMenuAction } from '@shared/models/files/file-menu-action.model';

import { FileSizePipe } from '../../pipes/file-size.pipe';

@Component({
  selector: 'osf-files-tree-row',
  imports: [Button, DatePipe, NgTemplateOutlet, FileSizePipe, TranslatePipe, StopPropagationDirective],
  templateUrl: './files-tree-row.component.html',
  styleUrl: './files-tree-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesTreeRowComponent {
  readonly file = input.required<FileModel>();
  readonly hasFoldersStack = input<boolean>(false);
  readonly actionsTemplate = input<TemplateRef<{ $implicit: FileModel; isFolder: boolean }> | null>(null);

  readonly openParentFolder = output<void>();
  readonly openEntry = output<FileModel>();
  readonly menuAction = output<FileMenuAction>();

  readonly isFolder = computed(() => this.file().kind === FileKind.Folder);

  readonly downloadsCount = computed(() => {
    if (!this.file().extra.downloads || this.isFolder()) {
      return '';
    }
    return this.file().extra.downloads;
  });

  onOpenEntry(): void {
    this.openEntry.emit(this.file());
  }
}
