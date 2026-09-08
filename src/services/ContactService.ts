const CONTACTS_KEY = "contacts";

export interface Contact {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const getContacts = (): Contact[] => {
  const contacts = localStorage.getItem(CONTACTS_KEY);

  return contacts ? JSON.parse(contacts) : [];
};

export const saveContact = (contact: Contact): boolean => {
  const contacts = getContacts();

  contacts.push(contact);

  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));

  return true;
};
