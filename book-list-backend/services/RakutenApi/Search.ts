import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { validateAsSearchParams } from "../Shared/InputValidator";
import { searchBooks } from "../Shared/RakutenApi";
import {
  addCorsHandler,
  getErrorStatusCode,
  handleError,
} from "../Shared/Utils";

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
    validateAsSearchParams(event.queryStringParameters);
    const books = await searchBooks(
      event.queryStringParameters?.["keyword"] as string
    );
    result.body = JSON.stringify(books);
  } catch (error) {
    result.statusCode = getErrorStatusCode(error);
    result.body = handleError(error);
  }
  return result;
};

export { handler };
