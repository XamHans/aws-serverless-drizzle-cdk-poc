**Project: aws-serverless-drizzle-cdk-poc**

This project demonstrates a Proof of Concept (POC) for utilizing Drizzle within an AWS Serverless environment. Drizzle is a lightweight Object-Relational Mapper (ORM) that simplifies database interactions. Please don't use prisma in your project, it's a nightmare in a serverless environment. 

**Getting Started**

1. **Clone the Repository:**
   Begin by cloning this repository using Git:

   ```bash
   git clone https://github.com/XamHans/aws-serverless-drizzle-cdk-poc.git
   ```

2. **AWS Account Setup:**
   - **Fresh Account:** If you're using a new AWS account, you'll need to set it up by following the AWS documentation: [https://docs.aws.amazon.com/](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
   - **Existing Account:** Ensure you have the necessary AWS credentials configured with appropriate permissions. You can create a `.aws/credentials` file or set environment variables to provide your access tokens.

3. **Deployment with CDK:**
   The AWS CDK (Cloud Development Kit) is used for infrastructure as code management in this project. To deploy the project, execute the following command:

   ```bash
   cdk deploy
   ```

**Integration with Drizzle**

For integrating Drizzle into your project, refer to the official Drizzle documentation: [https://orm.drizzle.team/kit-docs/quick](https://orm.drizzle.team/kit-docs/quick) specifically, the section on "Getting Started with PostgreSQL" using Node-Postgres: [https://orm.drizzle.team/kit-docs/quick](https://orm.drizzle.team/kit-docs/quick)

**Project Insights (Optional)**

- For a more in-depth understanding of the project, consider watching the YouTube video created by the project owner: [https://youtu.be/oyk51aT5B2c](https://youtu.be/oyk51aT5B2c)

**Additional Notes**

- Rename the .env.example to .env
- Define your secrets name in the .env file like ```POSTGRES_DB_SECRET="<your-secret-name-for-rds-cred>" ```
- With ```cdk destroy``` you can remove all the resources created by the CDK
