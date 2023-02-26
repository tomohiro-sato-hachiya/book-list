import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { validateAsBookEntry } from "../Shared/InputValidator";
import {
  getEventBody,
  handleError,
  addCorsHandler,
  getUserSub,
  getErrorStatusCode,
  removeNeedlessKeysFromBook,
  query,
} from "../Shared/Utils";
import { getBook } from "../Shared/RakutenApi";
import { SavedBook } from "../Shared/Model";
import { DuplicatedError, NotAuthenticatedError } from "../Shared/Error";

const TABLE_NAME = process.env.TABLE_NAME!;
const dbClient = new DynamoDB.DocumentClient();

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello",
  };
  addCorsHandler(result);
  try {
    const item = getEventBody(event);
    validateAsBookEntry(item);
    const book = await getBook(item.isbn);
    const sub = getUserSub(event);
    if (!sub) {
      throw new NotAuthenticatedError("認証情報が不正です");
    }
    const alreadyCreated = await query(dbClient, TABLE_NAME, sub, book.isbn);
    const alreadyCreatedBooks = JSON.parse(alreadyCreated) as SavedBook[];
    if (alreadyCreatedBooks.length) {
      throw new DuplicatedError("すでに登録済みです");
    }
    const savedBook: SavedBook = {
      ...removeNeedlessKeysFromBook(book),
      sub,
      isRead: !!item.isRead,
    };
    await dbClient
      .put({
        TableName: TABLE_NAME,
        Item: savedBook,
      })
      .promise();
    result.body = JSON.stringify({ isbn: savedBook.isbn });
  } catch (error) {
    result.statusCode = getErrorStatusCode(error);
    result.body = handleError(error);
  }
  return result;
};

export { handler };
