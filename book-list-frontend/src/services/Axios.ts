import axios, { AxiosInstance } from "axios";
import { Auth } from "aws-amplify";
import { CognitoUser } from "@aws-amplify/auth";
import { handleError } from "../utils/Utils";

const getAxiosInstance = async (): Promise<AxiosInstance> => {
  let axiosInstance: AxiosInstance = axios.create();
  await Auth.currentAuthenticatedUser()
    .then((user) => {
      if (user) {
        const cognitoUser = user as CognitoUser;
        axiosInstance = axios.create({
          baseURL: process.env.REACT_APP_API_ROOT_URL,
          headers: {
            Authorization: cognitoUser
              .getSignInUserSession()
              ?.getIdToken()
              .getJwtToken(),
          },
        });
      }
    })
    .catch((error) => {
      handleError(error);
    });
  return axiosInstance;
};

export default getAxiosInstance;
