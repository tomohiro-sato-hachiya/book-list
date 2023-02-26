import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {
  handleError,
  addCorsHandler,
  getUserSub,
  getErrorStatusCode,
  query,
} from "../Shared/Utils";
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
    const sub = getUserSub(event);
    if (!sub) {
      throw new NotAuthenticatedError("認証情報が不正です");
    }
    const isbn =
      event.queryStringParameters && "isbn" in event.queryStringParameters
        ? event.queryStringParameters["isbn"]
        : undefined;
    result.body = await query(dbClient, TABLE_NAME, sub, isbn);
  } catch (error) {
    result.statusCode = getErrorStatusCode(error);
    result.body = handleError(error);
  }
  return result;
};

export { handler };
