import React from "react";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Button } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "./pages/rakutenApi/search/Search";
import BookShelf from "./pages/bookList/Bookshelf";
import Book from "./pages/bookList/Book";

Amplify.configure({
  aws_project_region: process.env.REACT_APP_AWS_PROJECT_REGION,
  aws_cognito_region: process.env.REACT_APP_AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.REACT_APP_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: process.env.REACT_APP_AWS_USER_POOLS_CLIENT_ID,
  aws_cognito_signup_attributes:
    process.env.REACT_APP_AWS_COGNITO_SIGNUP_ATTRIBUTES?.split(","),
  aws_cognito_verification_mechanisms:
    process.env.REACT_APP_AWS_COGNITO_VERIFICATION_MECHANISMS?.split(","),
});

const App: React.FC = () => {
  return (
    <div className="App">
      <Authenticator>
        {({ signOut, user }) => (
          <>
            <main>
              <h1>Hello {user?.username}</h1>
              <Button onClick={signOut}>Sign out</Button>
              <BrowserRouter>
                <Routes>
                  <Route path="/search" element={<Search />} />
                  <Route path="/book/:isbn" element={<Book />}></Route>
                  <Route path="/*" element={<BookShelf />} />
                </Routes>
              </BrowserRouter>
            </main>
          </>
        )}
      </Authenticator>
    </div>
  );
};

export default App;
