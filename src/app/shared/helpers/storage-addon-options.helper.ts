import { FileProvider } from '@osf/features/files/constants';
import { ConfiguredAddonModel } from '@shared/models/addons/configured-addon.model';
import { FileFolderModel } from '@shared/models/files/file-folder.model';
import { FileLabelModel } from '@shared/models/files/file-label.model';

export function getConfiguredStorageAddonDisplayName(
  addons: ConfiguredAddonModel[],
  provider: string,
  osfStorageLabel: string
): string {
  if (provider === FileProvider.OsfStorage) {
    return osfStorageLabel;
  }

  return addons.find((addon) => addon.externalServiceName === provider)?.displayName ?? '';
}

export function mapRootFoldersToStorageLabels(
  rootFolders: FileFolderModel[] | null | undefined,
  addons: ConfiguredAddonModel[] | null | undefined,
  osfStorageLabel: string
): FileLabelModel[] {
  if (!rootFolders || !addons) {
    return [];
  }

  return rootFolders.map((folder) => ({
    label: getConfiguredStorageAddonDisplayName(addons, folder.provider, osfStorageLabel),
    folder,
  }));
}
