import * as cdk from "aws-cdk-lib";
import { Fn } from "aws-cdk-lib";
import {
  AuthorizationType,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { AuthorizerWrapper } from "./auth/AuthorizerWrapper";
import { GenericTable } from "./GenericTable";
import { WebAppDeployment } from "./WebAppDeployment";
import config from "./Config";

export class BookListBackendStack extends cdk.Stack {
  private api = new RestApi(this, "BookListApi");
  private authorizer: AuthorizerWrapper;
  private suffix: string;

  private bookListTable: GenericTable;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.initializeSuffix();

    this.authorizer = new AuthorizerWrapper(this, this.api);

    const optionWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId,
      },
    };
    const webAppDeployment = new WebAppDeployment(this, this.suffix);
    const additionalEnvironmentalVariables = {
      FRONT_URL: `https://${webAppDeployment.cloudFront.distributionDomainName}`,
      RAKUTEN_API_APP_ID: config.RAKUTEN_API_APP_ID,
    };
    this.bookListTable = new GenericTable(
      this,
      {
        tableName: "BookListTable",
        primaryKey: {
          partitionKey: {
            name: "sub",
            type: AttributeType.STRING,
          },
          sortKey: {
            name: "isbn",
            type: AttributeType.STRING,
          },
        },
        createLambdaPath: "Create",
        readLambdaPath: "Read",
        updateLambdaPath: "Update",
        deleteLambdaPath: "Delete",
      },
      additionalEnvironmentalVariables
    );

    const optionsHandlerLambdaId = "optionHandler";
    const optionsHandlerLambda = new NodejsFunction(
      this,
      optionsHandlerLambdaId,
      {
        entry: join(__dirname, "..", "services", "Shared", "Options.ts"),
        handler: "handler",
        functionName: optionsHandlerLambdaId,
        environment: {
          ...additionalEnvironmentalVariables,
        },
      }
    );
    const optionsHandlerLambdaIntegration = new LambdaIntegration(
      optionsHandlerLambda
    );

    const rakutenApiSearchLambdaId = "rakutenApiSearch";
    const rakutenApiSearchLambda = new NodejsFunction(
      this,
      rakutenApiSearchLambdaId,
      {
        entry: join(__dirname, "..", "services", "RakutenApi", "Search.ts"),
        handler: "handler",
        functionName: rakutenApiSearchLambdaId,
        environment: {
          ...additionalEnvironmentalVariables,
        },
      }
    );
    const rakutenApiSearchLambdaIntegration = new LambdaIntegration(
      rakutenApiSearchLambda
    );
    const RakutenApiResource = this.api.root.addResource("rakutenApi");
    RakutenApiResource.addMethod(
      "GET",
      rakutenApiSearchLambdaIntegration,
      optionWithAuthorizer
    );
    RakutenApiResource.addMethod("OPTIONS", optionsHandlerLambdaIntegration);

    const bookListResource = this.api.root.addResource("bookList");
    bookListResource.addMethod(
      "POST",
      this.bookListTable.createLambdaIntegration,
      optionWithAuthorizer
    );
    bookListResource.addMethod(
      "GET",
      this.bookListTable.readLambdaIntegration,
      optionWithAuthorizer
    );
    bookListResource.addMethod(
      "PATCH",
      this.bookListTable.updateLambdaIntegration,
      optionWithAuthorizer
    );
    bookListResource.addMethod(
      "DELETE",
      this.bookListTable.deleteLambdaIntegration,
      optionWithAuthorizer
    );
    bookListResource.addMethod("OPTIONS", optionsHandlerLambdaIntegration);
  }

  private initializeSuffix = (): void => {
    const shortStackId = Fn.select(2, Fn.split("/", this.stackId));
    const suffix = Fn.select(4, Fn.split("-", shortStackId));
    this.suffix = suffix;
  };
}
