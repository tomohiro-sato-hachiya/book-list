#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BookListBackendStack } from "../infrastructure/BookListBackendStack";

const app = new cdk.App();
new BookListBackendStack(app, "BookList", {
  stackName: "BookList",
});
