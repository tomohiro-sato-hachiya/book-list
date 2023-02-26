import React, { useState } from "react";
import { ImageList, Input } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { ApiBook } from "../../../model/Model";
import { handleError } from "../../../utils/Utils";
import BookListItemComponent from "../../../components/BookListItemComponent";
import getAxiosInstance from "../../../services/Axios";
import { Link } from "react-router-dom";

const Search: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [apiBooks, setApiBooks] = useState<ApiBook[]>([]);

  return (
    <div>
      <Link to="/">読了リストへ戻る</Link>
      <br />
      <Input
        placeholder="タイトル,著者名,ISBN..."
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
      />
      <IconButton
        type="button"
        aria-label="search"
        onClick={() => {
          if (keyword) {
            (async () => {
              const axiosInstance = await getAxiosInstance();
              axiosInstance
                .get(`/rakutenApi?keyword=${keyword}`)
                .then((response) => {
                  setApiBooks(response.data);
                })
                .catch((error) => {
                  handleError(error);
                });
            })();
          } else {
            alert("キーワードを入力してください");
          }
        }}
      >
        <SearchIcon />
      </IconButton>
      {apiBooks && (
        <ImageList>
          {apiBooks.map((apiBook) => (
            <BookListItemComponent
              book={{
                isbn: apiBook.isbn,
                title: apiBook.title,
                author: apiBook.author,
                publisherName: apiBook.publisherName,
                imageUrl: apiBook.largeImageUrl
                  ? apiBook.largeImageUrl
                  : apiBook.mediumImageUrl
                  ? apiBook.mediumImageUrl
                  : apiBook.smallImageUrl,
              }}
              isCreated={false}
              key={apiBook.isbn}
            />
          ))}
        </ImageList>
      )}
    </div>
  );
};

export default Search;
