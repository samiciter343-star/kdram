export type Language = "ru" | "kk";
export type Genre = "fam" | "rom" | "thr";

export interface Series {
  id: number;
  genre: Genre;
  colors: [string, string];
  title: Record<Language, string>;
  lead: string;
  other: Record<Language, string>;
}

export const episodeCount = 8;

export const seriesList: Series[] = [
  { id: 1, genre: "fam", colors: ["#e8a0b8", "#7a3b6e"], title: { ru: "Свекровь против невесты", kk: "Ене мен келін" }, lead: "Айгуль", other: { ru: "Свекровь", kk: "Ене" } },
  { id: 2, genre: "rom", colors: ["#9db8f0", "#3b4f9c"], title: { ru: "Босс из будущего", kk: "Болашақтан келген бастық" }, lead: "Данияр", other: { ru: "Алия", kk: "Алия" } },
  { id: 3, genre: "thr", colors: ["#7fc4b8", "#1f4b52"], title: { ru: "Долг чести", kk: "Намыс қарызы" }, lead: "Тимур", other: { ru: "Мадина", kk: "Мадина" } },
  { id: 4, genre: "rom", colors: ["#f2b88c", "#a3475a"], title: { ru: "Свадьба без жениха", kk: "Күйеусіз той" }, lead: "Салтанат", other: { ru: "Ерлан", kk: "Ерлан" } },
  { id: 5, genre: "fam", colors: ["#c9b6e8", "#52408f"], title: { ru: "Наследство в Алматы", kk: "Алматыдағы мұра" }, lead: "Асем", other: { ru: "Дядя Болат", kk: "Болат ағай" } },
  { id: 6, genre: "thr", colors: ["#8fa3b5", "#1d2433"], title: { ru: "Ночной рейс", kk: "Түнгі рейс" }, lead: "Камила", other: { ru: "Руслан", kk: "Руслан" } },
];

