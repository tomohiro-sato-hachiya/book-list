import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jose from "node-jose";
import {
  BookNotFoundError,
  DuplicatedError,
  MissingFieldError,
  NotAuthenticatedError,
} from "./Error";
import { Book } from "./Model";

export const getEventBody = (event: APIGatewayProxyEvent) => {
  return typeof event.body === "object" ? event.body : JSON.parse(event.body);
};

export const handleError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else {
    return "予期せぬエラー発生";
  }
};

export const getErrorStatusCode = (error: any): number => {
  if (error instanceof NotAuthenticatedError) {
    return 401;
  } else if (error instanceof MissingFieldError) {
    return 403;
  } else if (error instanceof BookNotFoundError) {
    return 404;
  } else if (error instanceof DuplicatedError) {
    return 403;
  } else {
    return 500;
  }
};

export const addCorsHandler = (result: APIGatewayProxyResult): void => {
  result.headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.FRONT_URL || "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  };
};

export const getUserSub = (event: APIGatewayProxyEvent): string => {
  try {
    const token = event.headers["Authorization"];
    const sections = token?.split(".");
    const payload = jose.util.base64url.decode(sections![1]);
    const parsedPayload = JSON.parse(payload.toString());
    const result: string = parsedPayload["sub"];
    return result;
  } catch (error) {
    console.log(handleError(error));
    return "";
  }
};

export const removeNeedlessKeysFromBook = (book: Book): Book => {
  const result: Book = {
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    publisherName: book.publisherName,
    itemCaption: book.itemCaption,
    salesDate: book.salesDate,
    itemUrl: book.itemUrl,
    imageUrl: book.imageUrl,
    booksGenreId: book.booksGenreId,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
  return result as Book;
};

export const now = (): string => new Date().toISOString();

export const query = async (
  dbClient: DynamoDB.DocumentClient,
  tableName: string,
  sub: string,
  isbn?: string
): Promise<string> => {
  let keyConditionExpression = "#sub = :sub";
  let expressionAttributeNames: any = {
    "#sub": "sub",
  };
  let expressionAttributeValues: any = {
    ":sub": sub,
  };
  if (isbn) {
    keyConditionExpression = `${keyConditionExpression} AND #isbn = :isbn`;
    expressionAttributeNames["#isbn"] = "isbn";
    expressionAttributeValues[":isbn"] = isbn;
  }
  const queryResponse = await dbClient
    .query({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
    .promise();
  return JSON.stringify(queryResponse.Items);
};
