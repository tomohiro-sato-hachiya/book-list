import { Button, ImageListItem, ImageListItemBar } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { BookBrief } from "../model/Model";
import getAxiosInstance from "../services/Axios";
import { handleError } from "../utils/Utils";

interface PROPS {
  book: BookBrief;
  isCreated: boolean;
  isRead?: boolean;
  counter?: number;
  setCounter?: React.Dispatch<React.SetStateAction<number>>;
  setIsRead?: React.Dispatch<React.SetStateAction<boolean>>;
}

const BookListItemComponent: React.FC<PROPS> = (props) => {
  const { book, isCreated, isRead, counter, setCounter, setIsRead } = props;
  const navigate = useNavigate();
  const reshowParentFlag =
    counter !== undefined &&
    setCounter !== undefined &&
    setIsRead !== undefined;

  const reshow = (isRead: boolean): void => {
    if (reshowParentFlag) {
      setIsRead(isRead);
      setCounter(counter + 1);
    }
  };

  const create = async (isRead: boolean): Promise<void> => {
    const axiosInstance = await getAxiosInstance();
    axiosInstance
      .post("/bookList", {
        isbn: book.isbn,
        isRead,
      })
      .then(() => {
        alert("登録に成功しました");
        reshow(isRead);
        navigate(`/${isRead ? "" : "wanted"}`);
      })
      .catch((error) => {
        handleError(error);
      });
  };

  const changeIsRead = async (): Promise<void> => {
    const axiosInstance = await getAxiosInstance();
    axiosInstance
      .patch("/bookList", {
        isbn: book.isbn,
        isRead: true,
      })
      .then(() => {
        alert("読了リストに移しました");
        reshow(true);
        navigate("/");
      })
      .catch((error) => {
        handleError(error);
      });
  };

  const remove = async (isRead: boolean): Promise<void> => {
    const axiosInstance = await getAxiosInstance();
    axiosInstance
      .delete("/bookList", {
        data: {
          isbn: book.isbn,
        },
      })
      .then(() => {
        alert("削除しました");
        reshow(isRead);
        navigate(`/${isRead ? "" : "wanted"}`);
      })
      .catch((error) => {
        handleError(error);
      });
  };

  const showDetail = (): void => {
    navigate(`/book/${book.isbn}`);
  };

  return (
    <ImageListItem key={book.isbn}>
      <img src={book.imageUrl} alt="" />
      <ImageListItemBar
        title={book.title}
        subtitle={
          <span>
            by {book.author}
            <br />
            {book.publisherName}
          </span>
        }
        actionIcon={
          <>
            {!isCreated && (
              <>
                <Button
                  color="primary"
                  onClick={() => {
                    void create(true);
                  }}
                >
                  読了リストに追加
                </Button>
                <Button
                  color="secondary"
                  onClick={() => {
                    void create(false);
                  }}
                >
                  読みたいリストに追加
                </Button>
              </>
            )}
            {isCreated && !isRead && (
              <Button
                color="primary"
                onClick={() => {
                  void changeIsRead();
                }}
              >
                読了リストに移動
              </Button>
            )}
            {isCreated && (
              <>
                <Button color="primary" onClick={showDetail}>
                  詳細を見る
                </Button>
                <Button
                  color="error"
                  onClick={() => {
                    void remove(isRead === true);
                  }}
                >
                  削除
                </Button>
              </>
            )}
          </>
        }
        position="below"
      />
    </ImageListItem>
  );
};

export default BookListItemComponent;
