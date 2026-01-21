import type { Locale } from "@/lib/i18n";

type DateParts = {
  day: number;
  monthIndex: number;
  year: number;
};

const EN_SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const EN_LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const KM_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const getDateParts = (value?: string | null): DateParts | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    day: date.getUTCDate(),
    monthIndex: date.getUTCMonth(),
    year: date.getUTCFullYear(),
  };
};

export const formatShortDate = (
  value: string | null | undefined,
  locale: Locale,
  options?: { includeYear?: boolean },
) => {
  const parts = getDateParts(value);
  if (!parts) {
    return null;
  }

  if (locale === "km") {
    const month = KM_MONTHS[parts.monthIndex];
    return options?.includeYear
      ? `${parts.day} ${month} ${parts.year}`
      : `${parts.day} ${month}`;
  }

  const month = EN_SHORT_MONTHS[parts.monthIndex];
  const base = `${month} ${parts.day}`;
  return options?.includeYear ? `${base}, ${parts.year}` : base;
};

export const formatLongDate = (
  value: string | null | undefined,
  locale: Locale,
) => {
  const parts = getDateParts(value);
  if (!parts) {
    return null;
  }

  if (locale === "km") {
    const month = KM_MONTHS[parts.monthIndex];
    return `${parts.day} ${month} ${parts.year}`;
  }

  const month = EN_LONG_MONTHS[parts.monthIndex];
  return `${month} ${parts.day}, ${parts.year}`;
};
