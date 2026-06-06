import { FileMetadata } from '@/hooks/common/use-file-upload';

export type TFieldValues =
  | string
  | number
  | boolean
  | 'intermediate'
  | Date
  | string[]
  | undefined
  | null
  | { from?: Date | undefined; to?: Date | undefined }
  | FileMetadata[]
  | FileMetadata;
