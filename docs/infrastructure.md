# Infrastructure

ShopSmart's cloud infrastructure is managed with **Terraform** and targets **AWS ECS Fargate** in `us-east-1`. All configuration lives in the `infra/` directory.

---

## Directory Layout

```
infra/
├── bootstrap/          One-time setup: creates the S3 bucket for Terraform state
├── versions.tf         Terraform + provider version pins
├── backend.tf          Remote state config (S3, no DynamoDB lock)
├── variables.tf        Input variable declarations
├── main.tf             AWS provider, random suffix, locals, IAM role selection
├── network.tf          Default VPC data source + security groups (ALB-SG, Service-SG)
├── ecr.tf              ECR repository for Docker images
├── s3.tf               Application S3 bucket
├── iam.tf              Execution + task IAM roles (with LabRole fallback)
├── ecs.tf              ECS cluster, CloudWatch log group, task definition, service
├── alb.tf              Application Load Balancer, target group, HTTP listener
└── outputs.tf          Outputs consumed by GitHub Actions
```

---

## Resources Provisioned

### Networking (`network.tf`)

| Resource | Name | Description |
|---|---|---|
| `aws_vpc` (data) | default | Uses the account's default VPC |
| `aws_subnets` (data) | default | All subnets in the default VPC |
| `aws_security_group` | `shopsmart-alb-sg` | Allows inbound HTTP (port 80) from anywhere; all egress |
| `aws_security_group` | `shopsmart-service-sg` | Allows inbound on port `5001` from the ALB SG only; all egress |

### Container Registry (`ecr.tf`)

| Resource | Description |
|---|---|
| `aws_ecr_repository` | Private ECR repo. `force_delete = true` so `terraform destroy` also removes images. |

### Storage (`s3.tf`)

| Resource | Description |
|---|---|
| `aws_s3_bucket` | Application bucket (e.g. for future asset storage). `force_destroy = true`. |

### IAM (`iam.tf`)

Two roles are created when `use_lab_role = false` (default):
- **Execution Role** — allows ECS to pull images from ECR and publish logs to CloudWatch.
- **Task Role** — assumed by the running container; minimal permissions.

When `use_lab_role = true` (required in AWS Academy), both roles are replaced by the pre-existing `LabRole`:
```
arn:aws:iam::<account-id>:role/LabRole
```

### ECS (`ecs.tf`)

| Resource | Configuration |
|---|---|
| `aws_cloudwatch_log_group` | `/ecs/shopsmart`, 7-day retention |
| `aws_ecs_cluster` | `shopsmart-cluster` |
| `aws_ecs_task_definition` | Fargate, `awsvpc` networking, 512 CPU / 1024 MB memory |
| `aws_ecs_service` | `desired_count = 1`, Fargate launch type, public IP |

**Container environment variables (hardcoded in task definition):**

| Variable | Value |
|---|---|
| `DATABASE_URL` | `file:/app/server/prisma/prod.db` |
| `NODE_ENV` | `production` |

### Application Load Balancer (`alb.tf`)

| Resource | Configuration |
|---|---|
| `aws_lb` | Internet-facing, application type |
| `aws_lb_target_group` | `ip` target type, health check on `GET /api/health` → `200` |
| `aws_lb_listener` | Port 80, HTTP, forwards to target group |

---

## Input Variables

| Variable | Default | Description |
|---|---|---|
| `aws_region` | `us-east-1` | AWS region |
| `project` | `shopsmart` | Project name prefix for all resources |
| `image_tag` | `latest` | Docker image tag to deploy |
| `container_port` | `5001` | Port the container listens on |
| `use_lab_role` | `false` | Set `true` in AWS Academy to use `LabRole` |

---

## Outputs

These are read by the GitHub Actions pipeline after `terraform apply`:

| Output | Description |
|---|---|
| `ecr_repository_url` | ECR URL for `docker push` |
| `ecs_cluster_name` | ECS cluster name for deployment |
| `ecs_service_name` | ECS service name for deployment |
| `task_definition_family` | Task definition family for rendering new revision |
| `s3_bucket_name` | Application S3 bucket name |
| `alb_dns_name` | ALB public DNS name for smoke testing |

---

## First-Time Setup

### 1. Bootstrap Terraform state

```bash
cd infra/bootstrap
# Edit main.tf if needed, then:
terraform init
terraform apply
# Note the output bucket name
```

### 2. Configure backend

Paste the bucket name into `infra/backend.tf`:
```hcl
terraform {
  backend "s3" {
    bucket = "<your-bootstrap-bucket-name>"
    key    = "shopsmart/terraform.tfstate"
    region = "us-east-1"
  }
}
```

### 3. Export AWS credentials

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...    # Required for AWS Academy
export AWS_REGION=us-east-1
```

### 4. Apply

```bash
cd infra
terraform init
terraform plan -out=tfplan -var=use_lab_role=true
terraform apply tfplan
```

---

## Refreshing Infrastructure

On subsequent runs (after session token renewal):

```bash
terraform plan -out=tfplan -var=use_lab_role=true
terraform apply tfplan
```

The GitHub Actions `terraform` job does this automatically on every push to `main`.

---

## Destroying Infrastructure

```bash
cd infra
terraform destroy -var=use_lab_role=true
```

ECR and S3 resources are configured with `force_delete`/`force_destroy = true`, so all images and objects are removed.

To also destroy the state bucket:

```bash
cd infra/bootstrap
terraform destroy
```

---

## AWS Academy Notes

- **Session tokens expire in ~3 hours.** If `terraform apply` fails with `ExpiredTokenException`, refresh credentials in the lab UI, re-export them, and re-run.
- **IAM role creation may be blocked.** Always pass `-var=use_lab_role=true` or the pipeline will fail when trying to create IAM roles.
- **GitHub Actions secrets must be refreshed** each Academy session (tokens change each time you open a lab).
