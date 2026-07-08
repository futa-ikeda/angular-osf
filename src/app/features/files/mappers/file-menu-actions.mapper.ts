import { SupportedFeature } from '@osf/shared/enums/addon-supported-features.enum';
import { FileMenuType } from '@osf/shared/enums/file-menu-type.enum';

export function mapMenuActions(supportedFeatures: SupportedFeature[]): Record<FileMenuType, boolean> {
  return {
    [FileMenuType.Download]: supportedFeatures.includes(SupportedFeature.DownloadAsZip),
    [FileMenuType.Rename]: supportedFeatures.includes(SupportedFeature.AddUpdateFiles),
    [FileMenuType.Delete]: supportedFeatures.includes(SupportedFeature.DeleteFiles),
    [FileMenuType.Move]:
      supportedFeatures.includes(SupportedFeature.CopyInto) &&
      supportedFeatures.includes(SupportedFeature.DeleteFiles) &&
      supportedFeatures.includes(SupportedFeature.AddUpdateFiles),
    [FileMenuType.Embed]: true,
    [FileMenuType.Share]: true,
    [FileMenuType.Copy]: true,
  };
}
