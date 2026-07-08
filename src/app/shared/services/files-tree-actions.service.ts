import { inject, Injectable } from '@angular/core';

import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';

@Injectable({
  providedIn: 'root',
})
export class FilesTreeActionsService {
  private readonly customConfirmationService = inject(CustomConfirmationService);

  confirmDropFiles(fileArray: File[], onConfirm: () => void): void {
    if (!fileArray.length) {
      return;
    }

    const isMultiple = fileArray.length > 1;

    this.customConfirmationService.confirmAccept({
      headerKey: isMultiple ? 'files.dialogs.uploadFiles.title' : 'files.dialogs.uploadFile.title',
      messageParams: isMultiple ? { count: fileArray.length } : { name: fileArray[0].name },
      messageKey: isMultiple ? 'files.dialogs.uploadFiles.message' : 'files.dialogs.uploadFile.message',
      acceptLabelKey: 'common.buttons.upload',
      onConfirm,
    });
  }

  confirmDeleteEntry(file: { kind: FileKind; name: string }, onConfirm: () => void): void {
    this.customConfirmationService.confirmDelete({
      headerKey: file.kind === FileKind.Folder ? 'files.dialogs.deleteFolder.title' : 'files.dialogs.deleteFile.title',
      messageParams: { name: file.name },
      messageKey:
        file.kind === FileKind.Folder ? 'files.dialogs.deleteFolder.message' : 'files.dialogs.deleteFile.message',
      acceptLabelKey: 'common.buttons.remove',
      onConfirm,
    });
  }
}
