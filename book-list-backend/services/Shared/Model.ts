interface BookBase {
  isbn: string;
}

export interface ApiBook extends BookBase {
  affiliateUrl: string;
  artistName: string;
  title: string;
  availability: string;
  author: string;
  publisherName: string;
  itemCaption: string;
  salesDate: string;
  itemUrl: string;
  largeImageUrl: string;
  mediumImageUrl: string;
  smallImageUrl: string;
  booksGenreId: string;
  chirayomiUrl: string;
  discountPrice: number;
  discountRate: number;
  hardware: string;
  itemPrice: number;
  jan: string;
  label: string;
  limitedFlag: number;
  listPrice: number;
  os: string;
  postageFlag: number;
  reviewAverage: string;
  reviewCount: number;
}

export interface ApiResponse {
  Items: {
    Item: ApiBook;
  }[];
}

export interface BookEntry extends BookBase {
  isRead: boolean;
}

export interface CreateBook extends BookEntry {}

export interface UpdateBook extends BookEntry {
  memo?: string;
}

export interface Book extends BookBase {
  title: string;
  author: string;
  publisherName: string;
  itemCaption: string;
  salesDate: string;
  itemUrl: string;
  imageUrl: string;
  booksGenreId: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedBook extends Book {
  sub: string;
  isRead: boolean;
  memo?: string;
}

export interface SearchParams {
  keyword: string;
}
