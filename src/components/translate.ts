import { useLocation } from "@builder.io/qwik-city";

export function useTranslate() {
  const { params } = useLocation();
  const lang = params.lang || 'en';
  return (record: Record<string, string>) => record[lang] || '';
}
