export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function normalizeOptionalString(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeOptionalUrl(value: FormDataEntryValue | string | null | undefined) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(normalized)
    ? normalized
    : `https://${normalized}`;

  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

export function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
