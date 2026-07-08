import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileModel } from '@osf/shared/models/files/file.model';

@Component({
  selector: 'osf-move-file-row',
  imports: [Button, Tooltip, TranslatePipe, IconComponent],
  templateUrl: './move-file-row.component.html',
  styleUrl: './move-file-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveFileRowComponent {
  readonly item = input.required<FileModel>();
  readonly isIndented = input<boolean>(false);
  readonly isBlocked = input<boolean>(false);
  readonly openFolder = output<FileModel>();

  readonly isFile = computed(() => this.item().kind === FileKind.File);
}
