"use client";

import { useNotification } from "@ui/hooks/use-notification";
import * as Notification from "./notification";

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
