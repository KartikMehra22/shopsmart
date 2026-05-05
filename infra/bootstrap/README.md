# Terraform State Bucket Bootstrap

Run **once**, locally, before the first `terraform apply` in `infra/`.

## Why

The main Terraform configuration in `infra/` uses an S3 backend for state.
That bucket has to exist before `terraform init` can succeed — so we create
it with a separate, self-contained Terraform config that uses local state.

## Steps

1. Export AWS credentials in your shell (Academy session token included):

   ```bash
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   export AWS_SESSION_TOKEN=...
   export AWS_REGION=us-east-1
   ```

2. Apply:

   ```bash
   cd infra/bootstrap
   terraform init
   terraform apply
   ```

3. Note the `tfstate_bucket_name` output. Paste it into
   `infra/backend.tf` (replace the `bucket = "shopsmart-tfstate-PLACEHOLDER"` line).

4. Commit only `infra/backend.tf`. **Do not commit** the bootstrap state
   files (`infra/bootstrap/terraform.tfstate*`) — they are gitignored.

## Re-running

You should not need to re-run the bootstrap. If the state bucket is destroyed,
re-run and update `backend.tf` with the new name.
