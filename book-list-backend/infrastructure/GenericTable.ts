import { Stack } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { join } from "path";

interface tableAttribute {
  name: string;
  type: AttributeType;
}

interface tableKey {
  partitionKey: tableAttribute;
  sortKey?: tableAttribute;
}

export interface TableProps {
  tableName: string;
  primaryKey: tableKey;
  createLambdaPath?: string;
  readLambdaPath?: string;
  updateLambdaPath?: string;
  deleteLambdaPath?: string;
  secondaryIndexes?: { key: tableKey; indexName: string }[];
}

export class GenericTable {
  private stack: Stack;
  private table: Table;
  private props: TableProps;

  private createLambda: NodejsFunction | undefined;
  private readLambda: NodejsFunction | undefined;
  private updateLambda: NodejsFunction | undefined;
  private deleteLambda: NodejsFunction | undefined;

  public createLambdaIntegration: LambdaIntegration;
  public readLambdaIntegration: LambdaIntegration;
  public updateLambdaIntegration: LambdaIntegration;
  public deleteLambdaIntegration: LambdaIntegration;

  private additionalEnvironmentalVariables: any | undefined;

  public constructor(
    stack: Stack,
    props: TableProps,
    additionalEnvironmentalVariables?: any
  ) {
    this.props = props;
    this.stack = stack;
    this.additionalEnvironmentalVariables = additionalEnvironmentalVariables;
    this.initialize();
  }

  private initialize = (): void => {
    this.createTable();
    this.addSecondaryIndexes();
    this.createLamdas();
    this.grantTableRights();
  };

  private createTable = (): void => {
    this.table = new Table(this.stack, this.props.tableName, {
      partitionKey: this.props.primaryKey.partitionKey,
      sortKey: this.props.primaryKey.sortKey,
      tableName: this.props.tableName,
    });
  };

  private addSecondaryIndexes = (): void => {
    if (this.props.secondaryIndexes) {
      for (const secondaryIndex of this.props.secondaryIndexes) {
        this.table.addGlobalSecondaryIndex({
          indexName: secondaryIndex.indexName,
          partitionKey: secondaryIndex.key.partitionKey,
          sortKey: secondaryIndex.key.sortKey,
        });
      }
    }
  };

  private createLamdas = (): void => {
    if (this.props.createLambdaPath) {
      this.createLambda = this.createSingleLambda(this.props.createLambdaPath);
      this.createLambdaIntegration = new LambdaIntegration(this.createLambda);
    }
    if (this.props.readLambdaPath) {
      this.readLambda = this.createSingleLambda(this.props.readLambdaPath);
      this.readLambdaIntegration = new LambdaIntegration(this.readLambda);
    }
    if (this.props.updateLambdaPath) {
      this.updateLambda = this.createSingleLambda(this.props.updateLambdaPath);
      this.updateLambdaIntegration = new LambdaIntegration(this.updateLambda);
    }
    if (this.props.deleteLambdaPath) {
      this.deleteLambda = this.createSingleLambda(this.props.deleteLambdaPath);
      this.deleteLambdaIntegration = new LambdaIntegration(this.deleteLambda);
    }
  };

  private grantTableRights = () => {
    if (this.createLambda) {
      // 複製エラーチェックを行う必要があるため、Write権限の他にRead権限も付与する
      this.table.grantReadWriteData(this.createLambda);
    }
    if (this.readLambda) {
      this.table.grantReadData(this.readLambda);
    }
    if (this.updateLambda) {
      this.table.grantWriteData(this.updateLambda);
    }
    if (this.deleteLambda) {
      this.table.grantWriteData(this.deleteLambda);
    }
  };

  private createSingleLambda = (lambdaName: string): NodejsFunction => {
    const lambdaId = `${this.props.tableName}-${lambdaName}`;
    const environment: any = {
      TABLE_NAME: this.props.tableName,
      ...this.additionalEnvironmentalVariables,
    };
    return new NodejsFunction(this.stack, lambdaId, {
      entry: join(
        __dirname,
        "..",
        "services",
        this.props.tableName,
        `${lambdaName}.ts`
      ),
      handler: "handler",
      functionName: lambdaId,
      environment,
    });
  };
}
