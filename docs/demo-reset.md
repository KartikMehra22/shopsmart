# Demo & Reset Guide

How to reset the AWS deployment to an empty state and rebuild it live, end-to-end. Useful for:
- A live viva demo ("watch the pipeline build everything from scratch")
- Testing the CI/CD pipeline after major changes
- Cleaning up stale data without destroying infrastructure

---

## What "reset" means here

| Reset type | Time to redeploy | What it touches |
|------------|------------------|-----------------|
| **Data only** (this guide) | ~3-5 min | Empties ECR, S3, scales ECS to 0. Keeps VPC/ALB/IAM/cluster. |
| Full destroy (`terraform destroy`) | ~10-15 min | Wipes all infrastructure. Slower, riskier. Not covered here. |

For demos, **data-only reset is almost always the right choice** — faster, lower risk, still shows the meaningful CI/CD flow.

---

## Prerequisites (one-time)

| Requirement | How to check |
|-------------|--------------|
| AWS CLI installed | `aws --version` |
| Terraform installed | `terraform version` |
| `gh` CLI installed (optional, for triggering pipeline from terminal) | `gh --version` |
| Valid AWS credentials in your shell | `aws sts get-caller-identity` |
| Infra is currently deployed (at least once) | `cd infra && terraform output` should print values |

If `aws sts get-caller-identity` fails: refresh your AWS Academy session and re-export `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`.

---

## The demo flow (5 steps, ~5 min)

### Step 1: Show the current state (optional, "before" picture)

Open three browser tabs:
- AWS Console → **ECR** → repos → `shopsmart` → Images tab (note: has images)
- AWS Console → **ECS** → clusters → `shopsmart-cluster` → Tasks (note: 1 task running)
- The live app: `http://<alb-dns-name>` (note: app is up)

Get the ALB DNS:
```bash
cd infra
terraform output -raw alb_dns_name
```

---

### Step 2: Wipe the data

```bash
bash scripts/aws-nuke-data.sh --yes
```

Output you'll see:
```
==> Reading Terraform outputs from .../infra
==> Plan (region: us-east-1):
   ECR repo:    shopsmart
   S3 bucket:   shopsmart-...
   ECS cluster: shopsmart-cluster
   ECS service: shopsmart-service
==> Scaling ECS service 'shopsmart-service' to 0 tasks
==> Emptying ECR repo 'shopsmart'
==> Emptying S3 bucket 's3://shopsmart-...'
==> Done. To rebuild from scratch: ...
```

**Refresh the AWS Console tabs** from Step 1:
- ECR → empty
- ECS → 0 tasks
- App URL → 503 Service Unavailable (no targets)

This is your "from scratch" moment. AWS infra exists but contains nothing runnable.

---

### Step 3: Trigger the pipeline manually

**Option A — From the terminal (faster):**
```bash
gh workflow run cicd.yml --ref main
gh run watch                      # follow the latest run live
```

**Option B — From GitHub UI:**
1. Go to your repo → **Actions** tab.
2. Pick the **CI/CD** workflow on the left.
3. Click **Run workflow** → select `main` → **Run workflow**.
4. Click into the new run to watch it live.

---

### Step 4: Watch the pipeline rebuild everything

The pipeline runs four jobs in order:

| Job | What it does | Duration |
|-----|--------------|----------|
| `test` | Lint + unit tests + integration tests | ~1 min |
| `terraform` | `init → validate → plan → apply` (no-op since infra already exists) | ~30 sec |
| `build_push` | Build Docker image, push to ECR | ~1.5 min |
| `deploy` | Scale service to 1 (if needed) → register new task def → update service → smoke test | ~1.5 min |

**Things to point out during the demo:**
- `build_push` log shows `docker push` → "uploaded" → ECR refills.
- `deploy` log shows the **Ensure ECS service desired count >= 1** step scaling the service from 0 back to 1 (because the reset script left it at 0).
- `deploy` log shows ECS rolling out the new task def.
- Final smoke-test step: `curl http://<alb-dns>/api/health` returns `200`.

---

### Step 5: Verify the app is live

```bash
# Get the ALB DNS again (same as before)
ALB=$(cd infra && terraform output -raw alb_dns_name)

# Health check
curl -s "http://$ALB/api/health"
# Expected: {"status":"ok",...}

# Try a real endpoint
curl -s "http://$ALB/api/products" | head -50
```

Or just open `http://$ALB` in a browser.

**What to point out:**
- AWS Console → ECR → `shopsmart` → has fresh image with new SHA tag.
- AWS Console → ECS → `shopsmart-cluster` → `shopsmart-service` → 1 running task.
- Browser shows the live app.

End of demo.

---

## Script flags reference

| Flag | Effect |
|------|--------|
| *(none)* | Interactive — asks before deleting |
| `--yes` / `-y` | Skip confirmation (use for live demos) |
| `--dry-run` | Show what would be deleted, change nothing |
| `--clear-logs` | Also delete CloudWatch log streams under `/ecs/shopsmart` |
| `-h` / `--help` | Show help |

Examples:
```bash
bash scripts/aws-nuke-data.sh --dry-run                # rehearsal
bash scripts/aws-nuke-data.sh --yes                    # live demo
bash scripts/aws-nuke-data.sh --yes --clear-logs       # also wipe logs
```

---

## What gets deleted vs. kept

| Deleted (data) | Kept (infrastructure) |
|----------------|------------------------|
| All ECR images | ECR repository itself |
| All S3 bucket objects | S3 bucket itself |
| All running ECS tasks (scaled to 0) | ECS cluster, service, task definition |
| (Optional) CloudWatch log streams | CloudWatch log group |
| | VPC, subnets, security groups |
| | ALB, target group, listener |
| | IAM roles |
| | Terraform state bucket |

This means re-running the pipeline **does not** need to recreate infrastructure — it just refills it. That's why the demo is fast.

---

## What if something goes wrong mid-demo?

| Symptom | Quick recovery |
|---------|----------------|
| Pipeline `terraform` job fails with ExpiredToken | Refresh AWS Academy creds, update GitHub secrets, re-run the workflow |
| Pipeline `deploy` job times out | New task is unhealthy — check CloudWatch logs at `/ecs/shopsmart` |
| ALB still shows 503 after pipeline finishes | Wait 30s for target health checks. If still bad, see [troubleshooting.md](./troubleshooting.md#alb-returns-503-service-temporarily-unavailable) |
| Reset script fails | See [troubleshooting.md](./troubleshooting.md#6-demo-reset-script) |

---

## Rehearsal checklist (do this before the actual viva)

- [ ] AWS Academy session refreshed within the last hour
- [ ] Local AWS creds work: `aws sts get-caller-identity`
- [ ] GitHub secrets updated with the SAME credentials
- [ ] `terraform output` returns values (infra is deployed)
- [ ] Run `bash scripts/aws-nuke-data.sh --dry-run` — should list resources, no errors
- [ ] Tabs ready: GitHub Actions page, AWS ECR, AWS ECS, ALB URL
- [ ] Practice the explanation while the pipeline runs

You're ready.
