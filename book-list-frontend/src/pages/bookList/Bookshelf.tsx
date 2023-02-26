import { ImageList, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import BookListItemComponent from "../../components/BookListItemComponent";
import { SavedBook } from "../../model/Model";
import getAxiosInstance from "../../services/Axios";
import { handleError } from "../../utils/Utils";

const BookShelf: React.FC = () => {
  const params = useParams();
  const [isRead, setIsRead] = useState(params["*"] !== "wanted");
  const [books, setBooks] = useState<SavedBook[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    (async () => {
      const axiosInstance = await getAxiosInstance();
      axiosInstance
        .get("/bookList")
        .then((response) => {
          const showableBooks: SavedBook[] = [];
          for (const book of response.data as SavedBook[]) {
            if (book.isRead === isRead) {
              showableBooks.push(book);
            }
          }
          setBooks(showableBooks);
        })
        .catch((error) => {
          handleError(error);
        });
    })();
  }, [isRead, counter]);

  return (
    <div>
      <Link to="/search">本を探す</Link>
      <Tabs
        value={isRead}
        onChange={(e, value: any) => {
          setIsRead(value);
        }}
      >
        <Tab value={true} label="読了リスト" />
        <Tab value={false} label="読みたいリスト" />
      </Tabs>
      <ImageList>
        {books.map((book) => (
          <BookListItemComponent
            book={book}
            isCreated={true}
            isRead={isRead}
            setIsRead={setIsRead}
            counter={counter}
            setCounter={setCounter}
            key={book.isbn}
          />
        ))}
      </ImageList>
    </div>
  );
};

export default BookShelf;
