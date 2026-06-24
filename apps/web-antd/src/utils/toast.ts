import { message } from 'ant-design-vue';

/**
 * Thin wrapper over Ant Design's global message API, so call sites read like the
 * old toast store (`toast.success(...)`) while using Vben/Ant's notifications.
 */
export const toast = {
  success: (content: string) => message.success(content),
  error: (content: string) => message.error(content),
  warning: (content: string) => message.warning(content),
  info: (content: string) => message.info(content),
};
