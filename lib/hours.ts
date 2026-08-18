export function extractClosedDay(hours: string): string {
  const parenMatch = hours.match(/\(([^)]*휴무[^)]*)\)/);
  if (parenMatch) return parenMatch[1].trim();

  const commaMatch = hours.split(",").find((part) => part.includes("휴무"));
  if (commaMatch) return commaMatch.trim();

  const leadingMatch = hours.match(/^([가-힣·]+\s*휴무)/);
  if (leadingMatch) return leadingMatch[1].trim();

  return "확인 필요";
}
