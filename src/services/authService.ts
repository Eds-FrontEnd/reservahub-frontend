const USERS_KEY = "users";

export interface User {
  name: string;
  email: string;
  password: string;
}

const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);

  return users ? JSON.parse(users) : [];
};

export const registerUser = (user: User): boolean => {
  const users = getUsers();

  const userExists = users.some(
    (currentUser) => currentUser.email === user.email,
  );

  if (userExists) {
    return false;
  }

  users.push(user);

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return true;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();

  return (
    users.find((user) => user.email === email && user.password === password) ??
    null
  );
};
