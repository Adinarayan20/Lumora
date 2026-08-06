export const FileProvider = {
  LOCAL: 'LOCAL',
  S3: 'S3',
  GCS: 'GCS',
  CLOUDFLARE_R2: 'CLOUDFLARE_R2',
} as const;

export type FileProvider = (typeof FileProvider)[keyof typeof FileProvider];
