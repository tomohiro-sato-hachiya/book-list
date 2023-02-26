import { Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SavedBook } from "../../model/Model";
import getAxiosInstance from "../../services/Axios";
import { handleError } from "../../utils/Utils";

const Book: React.FC = () => {
  const { isbn } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<SavedBook | null>(null);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    (async () => {
      const axiosInstance = await getAxiosInstance();
      axiosInstance.get(`/bookList?isbn=${isbn}`).then((response) => {
        const responseBook = (response.data as SavedBook[])[0];
        setBook(responseBook);
        setMemo(responseBook.memo || "");
      });
    })();
  }, [isbn]);

  const changeIsRead = async (): Promise<void> => {
    if (book) {
      const axiosInstance = await getAxiosInstance();
      axiosInstance
        .patch("/bookList", {
          isbn: book.isbn,
          isRead: true,
        })
        .then(() => {
          alert("読了リストに移しました");
          navigate("/");
        })
        .catch((error) => {
          handleError(error);
        });
    }
  };

  const updateMemo = async (): Promise<void> => {
    if (book) {
      const axiosInstance = await getAxiosInstance();
      axiosInstance
        .patch("/bookList", {
          isbn: book.isbn,
          isRead: book.isRead,
          memo,
        })
        .then(() => {
          alert("メモを更新しました");
          navigate("/");
        })
        .catch((error) => {
          handleError(error);
        });
    }
  };

  const remove = async (isRead: boolean): Promise<void> => {
    if (book) {
      const axiosInstance = await getAxiosInstance();
      axiosInstance
        .delete("/bookList", {
          data: {
            isbn: book.isbn,
          },
        })
        .then(() => {
          alert("削除しました");
          navigate(`/${isRead ? "" : "wanted"}`);
        })
        .catch((error) => {
          handleError(error);
        });
    }
  };

  return (
    <div>
      {book && (
        <>
          <h3>
            {book.title}&nbsp;
            <a href={book.itemUrl} target="_blank" rel="noopener noreferrer">
              楽天で見る
            </a>
          </h3>
          <img src={book.imageUrl} alt="" />
          <h4>著者名:&nbsp;{book.author}</h4>
          <h4>出版元:&nbsp;{book.publisherName}</h4>
          <h4>出版日: {book.salesDate}</h4>
          <p>{book.itemCaption}</p>
          {book.isRead && (
            <>
              <TextField
                label="メモ、感想など..."
                multiline
                rows={5}
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value);
                }}
              />
              <br />
              <Button
                color="primary"
                onClick={() => {
                  void updateMemo();
                }}
              >
                更新
              </Button>
            </>
          )}
          {!book.isRead && (
            <Button
              color="primary"
              onClick={() => {
                void changeIsRead();
              }}
            >
              読了リストに移動
            </Button>
          )}
          <br />
          <Button
            color="error"
            onClick={() => {
              void remove(book.isRead);
            }}
          >
            削除
          </Button>
        </>
      )}
      {!book && <span>データ取得中...</span>}
    </div>
  );
};

export default Book;
