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
  now,
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
    result.body = await update(sub, request);
  } catch (error) {
    result.statusCode = getErrorStatusCode(error);
    result.body = handleError(error);
  }
  return result;
};

const update = async (sub: string, request: UpdateBook): Promise<string> => {
  const memo = request.isRead && request.memo ? request.memo : "";
  const datetime = now();
  const updateResult = await dbClient
    .update({
      TableName: TABLE_NAME,
      Key: {
        sub: sub,
        isbn: request.isbn,
      },
      UpdateExpression:
        "SET #isRead = :isRead, #memo = :memo, #createdAt = :createdAt, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#isRead": "isRead",
        "#memo": "memo",
        "#createdAt": "createdAt",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":isRead": request.isRead,
        ":memo": memo,
        ":createdAt": datetime,
        ":updatedAt": datetime,
      },
      ReturnValues: "UPDATED_NEW",
    })
    .promise();
  return JSON.stringify(updateResult);
};

export { handler };
