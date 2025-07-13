'use client';

import * as Notification from './notification';
import { useNotification } from '#/hooks/use-notification';

const NotificationProvider = () => {
  const { notifications } = useNotification();

  return (
    <Notification.Provider>
      {notifications.map(({ id, ...rest }) => {
        return <Notification.Root key={id} {...rest} />;
      })}
      <Notification.Viewport />
    </Notification.Provider>
  );
};

export { NotificationProvider };
