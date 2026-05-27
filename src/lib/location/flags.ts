export function displayCityName(location?: string) {
  if (!location) return "";
  const city = location.split(",")[0]?.trim();
  return city || location.trim();
}

export function normalizeCountryCode(countryCode?: string) {
  if (!countryCode || countryCode.length !== 2) return "";
  return countryCode.toUpperCase();
}
