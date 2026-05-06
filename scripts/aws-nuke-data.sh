#!/usr/bin/env bash
# aws-nuke-data.sh
#
# Wipes runtime DATA from the ShopSmart AWS environment so the CI/CD
# pipeline can rebuild from a clean slate. Keeps all infrastructure
# (VPC, ALB, ECS cluster/service, ECR repo, S3 bucket, IAM roles).
#
# What this script DELETES:
#   - All images in the ECR repository
#   - All objects in the application S3 bucket
#   - All running ECS tasks (service desired count -> 0)
#   - CloudWatch log streams under /ecs/shopsmart  (--clear-logs)
#
# What this script KEEPS:
#   - The ECR repo, S3 bucket, ECS cluster + service + task definition
#   - ALB, target group, listener, security groups, IAM roles, log group
#   - The Terraform state bucket
#
# After running: trigger the pipeline manually (GitHub Actions
# "CI/CD" -> Run workflow, or `gh workflow run cicd.yml --ref main`)
# to rebuild the image, push it, and scale ECS back to 1 task.
#
# Usage:
#   bash scripts/aws-nuke-data.sh                # interactive
#   bash scripts/aws-nuke-data.sh --yes          # skip confirmation
#   bash scripts/aws-nuke-data.sh --dry-run      # show plan, don't delete
#   bash scripts/aws-nuke-data.sh --clear-logs   # also delete log streams
#
# Requires: aws CLI, terraform, valid AWS credentials in env.

set -euo pipefail

# ---------- config ----------
INFRA_DIR="$(cd "$(dirname "$0")/.." && pwd)/infra"
REGION="${AWS_REGION:-us-east-1}"

# ---------- flags ----------
DRY_RUN=false
SKIP_CONFIRM=false
CLEAR_LOGS=false
for arg in "$@"; do
  case "$arg" in
    --dry-run)     DRY_RUN=true ;;
    --yes|-y)      SKIP_CONFIRM=true ;;
    --clear-logs)  CLEAR_LOGS=true ;;
    -h|--help)
      sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "Unknown flag: $arg" >&2; exit 2 ;;
  esac
done

# ---------- pretty print ----------
say()   { printf "\033[1;36m==>\033[0m %s\n" "$*"; }
warn()  { printf "\033[1;33m!! \033[0m %s\n" "$*"; }
err()   { printf "\033[1;31mXX \033[0m %s\n" "$*" >&2; }
run() {
  if $DRY_RUN; then
    printf "   \033[2m(dry-run) %s\033[0m\n" "$*"
  else
    eval "$@"
  fi
}

# ---------- pre-flight ----------
command -v aws       >/dev/null || { err "aws CLI not found"; exit 1; }
command -v terraform >/dev/null || { err "terraform not found"; exit 1; }
[[ -d "$INFRA_DIR" ]]            || { err "infra dir not found: $INFRA_DIR"; exit 1; }

aws sts get-caller-identity --output text >/dev/null 2>&1 \
  || { err "AWS credentials missing or expired. Refresh and re-export."; exit 1; }

# ---------- read terraform outputs ----------
say "Reading Terraform outputs from $INFRA_DIR"
pushd "$INFRA_DIR" >/dev/null
terraform init -input=false -lock=false >/dev/null

ECR_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || true)
S3_BUCKET=$(terraform output -raw s3_bucket_name      2>/dev/null || true)
ECS_CLUSTER=$(terraform output -raw ecs_cluster_name  2>/dev/null || true)
ECS_SERVICE=$(terraform output -raw ecs_service_name  2>/dev/null || true)
popd >/dev/null

# ECR repo name = last path segment of the URL
ECR_REPO=""
[[ -n "$ECR_URL" ]] && ECR_REPO="${ECR_URL##*/}"

# ---------- show plan ----------
echo
say "Plan (region: $REGION):"
printf "   ECR repo:    %s\n" "${ECR_REPO:-<not found>}"
printf "   S3 bucket:   %s\n" "${S3_BUCKET:-<not found>}"
printf "   ECS cluster: %s\n" "${ECS_CLUSTER:-<not found>}"
printf "   ECS service: %s\n" "${ECS_SERVICE:-<not found>}"
printf "   Clear logs:  %s\n" "$CLEAR_LOGS"
printf "   Dry run:     %s\n" "$DRY_RUN"
echo

if [[ -z "$ECR_REPO$S3_BUCKET$ECS_CLUSTER$ECS_SERVICE" ]]; then
  err "Could not read any Terraform outputs. Is the infra deployed?"
  exit 1
fi

# ---------- confirm ----------
if ! $SKIP_CONFIRM && ! $DRY_RUN; then
  read -r -p "Proceed with deleting DATA (not infra) listed above? [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || { warn "Aborted."; exit 0; }
fi

# ---------- 1. scale ECS service to 0 ----------
if [[ -n "$ECS_CLUSTER" && -n "$ECS_SERVICE" ]]; then
  say "Scaling ECS service '$ECS_SERVICE' to 0 tasks"
  run aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "$ECS_SERVICE" \
    --desired-count 0 \
    --region "$REGION" \
    --no-cli-pager --output text >/dev/null
fi

# ---------- 2. empty ECR repo ----------
if [[ -n "$ECR_REPO" ]]; then
  say "Emptying ECR repo '$ECR_REPO'"
  IMAGE_IDS=$(aws ecr list-images \
    --repository-name "$ECR_REPO" \
    --region "$REGION" \
    --query 'imageIds[*]' --output json 2>/dev/null || echo "[]")

  if [[ "$IMAGE_IDS" == "[]" || -z "$IMAGE_IDS" ]]; then
    say "  (already empty)"
  else
    run aws ecr batch-delete-image \
      --repository-name "$ECR_REPO" \
      --region "$REGION" \
      --image-ids "'$IMAGE_IDS'" \
      --no-cli-pager --output text >/dev/null
  fi
fi

# ---------- 3. empty S3 bucket ----------
if [[ -n "$S3_BUCKET" ]]; then
  say "Emptying S3 bucket 's3://$S3_BUCKET'"
  run aws s3 rm "s3://$S3_BUCKET" --recursive --region "$REGION"
fi

# ---------- 4. (optional) clear CloudWatch log streams ----------
if $CLEAR_LOGS; then
  LOG_GROUP="/ecs/shopsmart"
  say "Clearing log streams in '$LOG_GROUP'"
  STREAMS=$(aws logs describe-log-streams \
    --log-group-name "$LOG_GROUP" \
    --region "$REGION" \
    --query 'logStreams[*].logStreamName' --output text 2>/dev/null || true)
  if [[ -z "$STREAMS" ]]; then
    say "  (no streams found)"
  else
    for s in $STREAMS; do
      run aws logs delete-log-stream \
        --log-group-name "$LOG_GROUP" \
        --log-stream-name "$s" \
        --region "$REGION"
    done
  fi
fi

echo
say "Done. To rebuild from scratch:"
echo "   1. Make sure GitHub secrets have fresh AWS_* credentials"
echo "   2. Trigger the pipeline:  gh workflow run cicd.yml --ref main"
echo "      (or use the 'Run workflow' button in GitHub Actions UI)"
echo "   3. Pipeline will: build image -> push to ECR -> deploy to ECS"
