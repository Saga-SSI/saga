export type LocationSuggestion = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  label: string;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

function pickCity(address: NominatimResult["address"]) {
  if (!address) return "";
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.state ||
    ""
  );
}

export function mapNominatimResults(results: NominatimResult[]): LocationSuggestion[] {
  const seen = new Set<string>();

  return results
    .map((result) => {
      const city = pickCity(result.address);
      const country = result.address?.country ?? "";
      const countryCode = (result.address?.country_code ?? "").toUpperCase();
      const label = city || result.display_name.split(",")[0]?.trim() || "";

      return {
        id: String(result.place_id),
        city: label,
        country,
        countryCode,
        label,
      };
    })
    .filter((item) => {
      if (!item.label || !item.countryCode) return false;
      const key = `${item.label.toLowerCase()}:${item.countryCode}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    addressdetails: "1",
    limit: "8",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        "User-Agent": "SagaApp/1.0 (profile location search)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error("Location search failed");
  }

  const data = (await response.json()) as NominatimResult[];
  return mapNominatimResults(data);
}
