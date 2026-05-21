const headerDateFormat: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

function getDeviceLocale(): string | undefined {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return undefined;
}

export function formatDate(date: Date, locale: string | undefined = getDeviceLocale()): string {
  return new Intl.DateTimeFormat(locale, headerDateFormat).format(date);
}
