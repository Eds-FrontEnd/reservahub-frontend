// const CONTACTS_KEY = "contacts";

const VITE_API_URL_CONTACT = import.meta.env.VITE_API_URL;

export interface Contact {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  status: number;
  data?: unknown;
}

export const saveContact = async (
  contact: Contact,
): Promise<ContactResponse> => {
  const response = await fetch(`${VITE_API_URL_CONTACT}/api/contato`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  return {
    status: response.status,
    data,
  };
};

// const getContacts = (): Contact[] => {
//   const contacts = localStorage.getItem(CONTACTS_KEY);

//   return contacts ? JSON.parse(contacts) : [];
// };

// export const saveContact = (contact: Contact): boolean => {
//   const contacts = getContacts();

//   contacts.push(contact);

//   localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));

//   return true;
// };
