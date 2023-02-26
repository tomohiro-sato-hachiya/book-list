import { MissingFieldError } from "./Error";
import { BookEntry, SearchParams } from "./Model";

export const validateAsBookEntry = (arg: any) => {
  if (!(arg as BookEntry).isbn) {
    throw new MissingFieldError("ISBNの指定が必要です");
  }
};

export const validateAsSearchParams = (arg: any) => {
  if (!(arg as SearchParams).keyword) {
    throw new MissingFieldError("キーワードの指定が必要です");
  }
};
