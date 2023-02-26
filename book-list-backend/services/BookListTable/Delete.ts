import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {
  handleError,
  addCorsHandler,
  getUserSub,
  getErrorStatusCode,
  getEventBody,
} from "../Shared/Utils";
import { validateAsBookEntry } from "../Shared/InputValidator";
import { UpdateBook } from "../Shared/Model";
import { NotAuthenticatedError } from "../Shared/Error";

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
    const request = getEventBody(event);
    validateAsBookEntry(request);
    const sub = getUserSub(event);
    if (!sub) {
      throw new NotAuthenticatedError("認証情報が不正です");
    }
    const deleteResult = await dbClient
      .delete({
        TableName: TABLE_NAME,
        Key: {
          sub: sub,
          isbn: request.isbn,
        },
      })
      .promise();
    result.body = JSON.stringify(deleteResult);
  } catch (error) {
    result.statusCode = getErrorStatusCode(error);
    result.body = handleError(error);
  }
  return result;
};

export { handler };
