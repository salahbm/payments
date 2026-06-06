import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

export const validatePhone = (value: string, country = 'US') => {
  const phone = parsePhoneNumberFromString(value, country as CountryCode);
  return phone?.isValid() ? phone.formatInternational() : null;
};
