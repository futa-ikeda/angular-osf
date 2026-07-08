export function getMfrUrlWithVersion(
  mfrUrl: string | undefined,
  version?: string,
  viewOnlyParam?: string | null
): string | null {
  if (!mfrUrl) return null;
  const mfrUrlObj = new URL(mfrUrl);
  const encodedDownloadUrl = mfrUrlObj.searchParams.get('url');
  if (!encodedDownloadUrl) return mfrUrl;

  const downloadUrlObj = new URL(decodeURIComponent(encodedDownloadUrl));

  if (version) downloadUrlObj.searchParams.set('version', version);
  if (viewOnlyParam) downloadUrlObj.searchParams.set('view_only', viewOnlyParam);

  mfrUrlObj.searchParams.set('url', downloadUrlObj.toString());

  return mfrUrlObj.toString();
}
