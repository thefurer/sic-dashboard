export const COUNTRIES = [
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', phoneCode: '+593' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', phoneCode: '+57' },
] as const;

export type CountryCode = typeof COUNTRIES[number]['code'];

export function getCountryByCode(code: string | null): typeof COUNTRIES[number] | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCountryByPhoneCode(phone: string | null): typeof COUNTRIES[number] | undefined {
  if (!phone) return undefined;
  return COUNTRIES.find(c => phone.startsWith(c.phoneCode));
}

export function detectCountryFromPhone(phone: string): CountryCode {
  if (phone.startsWith('+57') || phone.startsWith('57')) return 'CO';
  // Default to Ecuador
  return 'EC';
}

export function getCountryFlag(code: string | null): string {
  const country = getCountryByCode(code);
  return country?.flag || '🌍';
}

export function getCountryName(code: string | null): string {
  const country = getCountryByCode(code);
  return country?.name || 'Desconocido';
}
