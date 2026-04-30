export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,32}$/;
export const PROTECTED_ROUTES = ["/dashboard", "/billing", "/settings"];
export const AUTH_ROUTES = ["/auth"];
