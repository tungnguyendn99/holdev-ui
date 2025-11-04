import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { Ban, Check, Info, MessageCircleWarning } from 'lucide-react';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const icons = {
  success: <Check />,
  info: <Info />,
  warning: <MessageCircleWarning />,
  error: <Ban />,
};
export const openNotification = (type: NotificationType, args: ArgsProps) => {
  notification[type]({
    icon: icons[type],
    ...args,
  });
};
