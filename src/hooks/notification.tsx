// import { notification } from 'antd';
// import type { NotificationInstance } from 'antd/es/notification/interface';
// import { Check, Info, MessageCircleWarning, Ban } from 'lucide-react';

// type NotificationType = 'success' | 'info' | 'warning' | 'error';

// const icons = {
//   success: <Check />,
//   info: <Info />,
//   warning: <MessageCircleWarning />,
//   error: <Ban />,
// };

// export const useAppNotification = () => {
//   const [api, contextHolder] = notification.useNotification();

//   const openNotification = (
//     type: NotificationType,
//     args: Parameters<NotificationInstance['success']>[0],
//   ) => {
//     api[type]({
//       icon: icons[type],
//       ...args,
//     });
//   };

//   return { openNotification, contextHolder };
// };
