import axios from "axios";
import { ApiBook, ApiResponse, Book } from "./Model";
import { handleError, now } from "./Utils";

const RAKUTEN_API_APP_ID = process.env.RAKUTEN_API_APP_ID!;
const RAKUTEN_API_GENRE_IDS = ["001", "005", "007"];

const callApi = async (keyword?: string, isbn?: string): Promise<ApiBook[]> => {
  const result: ApiBook[] = [];
  const keywordParam = keyword ? `&keyword=${encodeURIComponent(keyword)}` : "";
  const isbnParam = isbn ? `&isbnjan=${encodeURIComponent(isbn)}` : "";
  for (const genreId of RAKUTEN_API_GENRE_IDS) {
    const genreIdParam = `&booksGenreId=${genreId}`;
    const url = `https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404?format=json&${keywordParam}${isbnParam}${genreIdParam}&applicationId=${RAKUTEN_API_APP_ID}`;
    await axios
      .get(url)
      .then((response) => {
        console.log(response);
        const apiResponse: ApiResponse = response.data;
        for (const item of apiResponse.Items) {
          result.push(item.Item);
        }
      })
      .catch((error) => {
        console.log(url);
        handleError(error);
        throw error;
      });
  }
  return result;
};

export const searchBooks = async (keyword: string): Promise<ApiBook[]> => {
  const apiBooks: ApiBook[] = await callApi(keyword);
  return apiBooks;
};

export const getBook = async (isbn: string): Promise<Book> => {
  const apiBook: ApiBook = (await callApi(undefined, isbn))[0];
  const datetime = now();
  const book: Book = {
    ...apiBook,
    booksGenreId: apiBook.booksGenreId.split("/"),
    imageUrl: apiBook.largeImageUrl
      ? apiBook.largeImageUrl
      : apiBook.mediumImageUrl
      ? apiBook.mediumImageUrl
      : apiBook.smallImageUrl,
    createdAt: datetime,
    updatedAt: datetime,
  };
  return book;
};
