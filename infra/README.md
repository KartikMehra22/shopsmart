# ShopSmart Infrastructure (Terraform)

This directory contains the Terraform configuration that provisions
the AWS infrastructure for ShopSmart on ECS Fargate.

## Layout

```
infra/
├── versions.tf  Terraform + provider version pins.
├── backend.tf   S3 backend.
├── variables.tf Input variables.
├── main.tf      AWS provider, random suffix, locals.
├── network.tf   Default VPC data + ALB/service SGs.
├── ecr.tf       ECR repository.
├── s3.tf        Application S3 bucket (rubric requirement).
├── iam.tf       Execution + task IAM roles (LabRole fallback).
├── ecs.tf       Cluster, log group, task definition, service.
├── alb.tf       Application Load Balancer + target group + listener.
└── outputs.tf   Outputs consumed by the GitHub Actions pipeline.
```

## First-time setup

1. Configure AWS credentials in your shell (Academy session token included):

   ```bash
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   export AWS_SESSION_TOKEN=...
   export AWS_REGION=us-east-1
   ```

2. Initialize and apply:

   ```bash
   terraform init
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

## AWS Academy notes

- **Session tokens expire (~3 hours).** When `apply` fails with `ExpiredToken`,
  refresh credentials in the lab UI, re-export them, and re-run.
- **IAM role creation may be blocked.** If `apply` fails on
  `aws_iam_role.execution` or `aws_iam_role.task`, re-run with
  `terraform apply -var=use_lab_role=true` to use the pre-existing
  `LabRole`. GitHub Actions: set the same variable through a TF_VAR or
  `-var` flag in the workflow if needed.

## Refreshing infrastructure

Subsequent runs only need:

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

The pipeline calls these from the `terraform` job on every push to `main`.

## Destroying

```bash
terraform destroy
```

ECR has `force_delete = true` and S3 has `force_destroy = true`, so this
removes images and bucket contents along with the resources.
