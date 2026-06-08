export const PHONE_REGEX = /^[1-9]\d{7,14}$/; // 8-15 digits, no +
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const PASSWORD_REGEX =
  /^(?=.*[A-Za-z]|\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/;
