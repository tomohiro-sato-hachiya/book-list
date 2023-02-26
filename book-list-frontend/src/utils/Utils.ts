import { AxiosError } from "axios";

export const handleError = (error: any): void => {
  console.log(error);
  if (error instanceof AxiosError && error.response) {
    alert(error.response.data);
  } else if (error instanceof Error) {
    alert(error.message);
  } else if (typeof error === "string") {
    alert(error);
  } else {
    alert("エラーが発生しました");
  }
};
