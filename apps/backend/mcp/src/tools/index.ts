import { contactsCreate } from "./contacts/create";
import { contactsDelete } from "./contacts/delete";
import { contactsGet } from "./contacts/get";
import { contactsList } from "./contacts/list";
import { contactsUpdate } from "./contacts/update";
import { emailSend } from "./email/send";

export const tools = [
	contactsList,
	contactsGet,
	contactsCreate,
	contactsUpdate,
	contactsDelete,
	emailSend,
] as const;
