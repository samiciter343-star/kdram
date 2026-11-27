import { seriesList, type Language } from "@/data/catalog";

export function GET(request: Request) {
  const url = new URL(request.url);
  const requestedLanguage = url.searchParams.get("lang");
  const requestedGenre = url.searchParams.get("genre");
  const allowedGenres = ["fam", "rom", "thr"];
  const isValidGenre = allowedGenres.includes(requestedGenre ?? "");

  if (requestedGenre !== null && !isValidGenre) {
    return Response.json(
      { error: "Неизвестный жанр" },
      { status: 400 },
    );
  }

  const language: Language = requestedLanguage === "ru" ? "ru" : "kk";
  const filteredSeries = requestedGenre
    ? seriesList.filter((series) => series.genre === requestedGenre)
    : seriesList;

  const localizedSeries = filteredSeries.map((series) => ({
    ...series,
    title: series.title[language],
    other: series.other[language],
  }));

  return Response.json(localizedSeries);
}
