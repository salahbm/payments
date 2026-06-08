/**
 * Why interface? In case user gets extra fields it is easier to extend with interface comparated to the type
 */
export interface User {
  id: string;
  email: string;
  name: string;
}
