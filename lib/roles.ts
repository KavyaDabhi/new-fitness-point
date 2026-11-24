export const ADMIN_EMAILS = [
  "dabhikavy189@gmail.com",
  "newfitnesspointgym@gmail.com",
  "newfitnesspoint@gmail.com",
];

export const TRAINER_EMAILS = [
  "smartyboy8733@gmail.com",
  "trainer2@newfitnesspoint.com",
];

export const isAdmin = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());

export const isTrainer = (email?: string | null) =>
  !!email && TRAINER_EMAILS.includes(email.trim().toLowerCase());

export const canAccessTrainerPortal = (email?: string | null) =>
  isTrainer(email) || isAdmin(email);