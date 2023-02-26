import { CfnOutput, Stack } from "aws-cdk-lib";
import { CloudFrontWebDistribution } from "aws-cdk-lib/aws-cloudfront";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { join } from "path";

export class WebAppDeployment {
  private stack: Stack;
  private bucketSuffix: string;
  private deploymentBucket: Bucket;
  public cloudFront: CloudFrontWebDistribution;

  constructor(stack: Stack, bucketSuffix: string) {
    this.stack = stack;
    this.bucketSuffix = bucketSuffix;
    this.initialize();
  }

  private initialize = (): void => {
    const bukcetName = `book-list-app-web${this.bucketSuffix}`;
    this.deploymentBucket = new Bucket(this.stack, "book-list-web", {
      bucketName: bukcetName,
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
    });
    new BucketDeployment(this.stack, "book-list-web-bucket-deployment", {
      destinationBucket: this.deploymentBucket,
      sources: [
        Source.asset(
          join(__dirname, "..", "..", "book-list-frontend", "build")
        ),
      ],
    });
    new CfnOutput(this.stack, "BookListWebAppS3Url", {
      value: this.deploymentBucket.bucketWebsiteUrl,
    });

    this.cloudFront = new CloudFrontWebDistribution(
      this.stack,
      "book-list-web-app-distribution",
      {
        originConfigs: [
          {
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
            s3OriginSource: {
              s3BucketSource: this.deploymentBucket,
            },
          },
        ],
      }
    );
    new CfnOutput(this.stack, "BookListWebAppCloudFrontUrl", {
      value: `https://${this.cloudFront.distributionDomainName}`,
    });
  };
}
