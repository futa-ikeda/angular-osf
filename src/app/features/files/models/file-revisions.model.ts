export interface OsfFileRevision {
  downloads: number;
  hashes: {
    md5: string;
    sha256: string;
  };
  version: string;
  dateTime: Date;
}
