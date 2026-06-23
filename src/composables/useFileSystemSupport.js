import { ref } from 'vue';
import { isFileSystemAccessSupported } from '@/utils/fileSystem';

export function useFileSystemSupport() {
  const supported = ref(isFileSystemAccessSupported());
  return { supported };
}
