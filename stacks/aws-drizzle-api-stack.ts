import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import * as dotenv from "dotenv";
import path = require('path');

dotenv.config();

export class AwsDrizzleApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function
    const getUserLambda = new NodejsFunction(this, 'UserGetHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambdas/user-get.ts'),
      handler: 'handler',
      initialPolicy: [
        new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [`arn:aws:secretsmanager:${this.region}:${this.account}:secret:${process.env.POSTGRES_DB_SECRET}-*`],
      })
      ],
      environment: {
        POSTGRES_DB_SECRET: process.env.POSTGRES_DB_SECRET ?? 'connectionUrl',
      }
    });

    // Define the API Gateway
    const api = new apigateway.RestApi(this, 'UsersEndpoint', {
      restApiName: 'users-api',
    });

    // Define a resource and method for the API Gateway
    const drizzleResource = api.root.addResource('users');
    drizzleResource.addMethod('GET', new apigateway.LambdaIntegration(getUserLambda));

    

    //---------------------------

      // Define the VPC for the RDS instance
    const vpc = new ec2.Vpc(this, 'RdsVpc', {
      maxAzs: 2, // Default is all AZs in region
      natGateways: 1,
    });

    if(!process.env.POSTGRES_DB_SECRET)
      throw new Error('POSTGRES_DB_SECRET must be defined in the environment');

     // first, lets generate a secret to be used as credentials for our database
    const credentials = rds.Credentials.fromGeneratedSecret('dbuser', {
      secretName: `${process.env.POSTGRES_DB_SECRET}`,
    });


    // Allow lambda function to access secrets manager
    credentials.secret?.grantRead(getUserLambda);

    const securityGroup = new ec2.SecurityGroup(this, `security-group-postgres`, {
      vpc: vpc,
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'allow public access to the RDS instance', true);


    // Define the RDS instance
    const dbInstance = new rds.DatabaseInstance(this, 'RdsInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14, 
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      
      publiclyAccessible: true, // Make the database publicly accessible
      credentials: credentials, // Use a generated secret for the master user
      allocatedStorage: 20, // Adjust storage as needed
      backupRetention: cdk.Duration.days(0), // Adjust retention period as needed
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Remove the instance and its data when the stack is deleted
      securityGroups: [securityGroup],
    });



    // Output the database endpoint
    new cdk.CfnOutput(this, 'DbEndpoint', {
      value: dbInstance.dbInstanceEndpointAddress,
    });
  

     // output a few properties to help use find the credentials 
    new cdk.CfnOutput(this, 'Secret Name', { value: credentials.secretName ?? '' }); 

  }
}