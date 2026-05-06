# Troubleshooting

Common errors you'll hit and exactly how to fix them. Organized by where the error happens.

> **Tip:** If your error isn't here, check `docker logs`, `terraform plan`, or the GitHub Actions log first — the real cause is almost always in one of those.

---

## Table of Contents
1. [Local Development](#1-local-development)
2. [Docker](#2-docker)
3. [Terraform](#3-terraform)
4. [GitHub Actions Pipeline](#4-github-actions-pipeline)
5. [AWS / Live App](#5-aws--live-app)
6. [Demo Reset Script](#6-demo-reset-script)

---

## 1. Local Development

### `EADDRINUSE: address already in use :::5001` (or `:::5173`)
**Cause:** Something is already listening on that port (maybe an old `pnpm run dev` you forgot to stop).

**Fix:**
```bash
# Find what's holding the port
lsof -i :5001

# Kill it (replace PID with the number from above)
kill -9 <PID>

# Or kill anything on the port in one shot
kill -9 $(lsof -t -i :5001)
```

---

### `command not found: pnpm`
**Cause:** pnpm isn't installed globally.

**Fix:**
```bash
npm install -g pnpm
# Then verify
pnpm --version
```

---

### `Error: P1003: Database file at "..." does not exist`
**Cause:** SQLite database file was deleted or never created.

**Fix:**
```bash
cd server
pnpm prisma migrate deploy   # Creates dev.db and applies schema
pnpm prisma db seed          # Loads sample data
cd ..
```

---

### `Prisma Client did not initialize yet`
**Cause:** The generated Prisma client is missing or stale.

**Fix:**
```bash
cd server
pnpm prisma generate
```

---

### `database is locked` (SQLite)
**Cause:** Another process has the SQLite file open (often a leftover server, a Prisma Studio tab, or a debugger).

**Fix:**
1. Stop all running servers (`Ctrl+C` in any open terminal).
2. Close Prisma Studio if open.
3. If still locked, restart the SQLite-touching process:
   ```bash
   pkill -f "node server.js"
   pkill -f "prisma"
   ```

---

### Frontend can't reach API (`Failed to fetch`)
**Causes & fixes:**
- The API server isn't running. Check `http://localhost:5001/api/health` in your browser.
- The Vite proxy isn't picking up `/api/*`. Restart `pnpm run dev`.
- You set `VITE_API_URL` to a stale URL. Either remove it from `.env` (proxy will work) or set it to `http://localhost:5001`.

---

### `pnpm install` fails with "ERR_PNPM_PEER_DEP_ISSUES"
**Fix:** Use the project's lockfile:
```bash
pnpm install --frozen-lockfile
```

---

## 2. Docker

### `Cannot connect to the Docker daemon`
**Cause:** Docker Desktop isn't running.

**Fix:** Open Docker Desktop. Wait for the whale icon in your menu bar. Re-run.

---

### `docker compose up` fails with "port already allocated"
**Cause:** Some other container or process owns the port.

**Fix:**
```bash
docker compose down                  # stop this stack
docker ps                            # see what else is running
docker stop <other-container-id>     # stop the conflict
docker compose up -d                 # try again
```

---

### Build is slow / cache not working
**Cause:** Dockerfile order is wrong or you ran `--no-cache`.

**Fix:** Make sure `package.json` is copied before the source code in the Dockerfile (it already is in this project). Avoid `--no-cache` unless debugging.

---

### Container exits immediately
**Cause:** App crashed on startup.

**Fix:** Look at the logs:
```bash
docker compose logs -f web
# or
docker logs <container-id>
```
Common causes: missing env vars, DB unreachable, syntax error in code.

---

### "no space left on device"
**Cause:** Old Docker images and containers piled up.

**Fix:**
```bash
docker system prune -a --volumes
```
Warning: this deletes everything not currently in use, including images you might want back.

---

## 3. Terraform

### `Error: error configuring S3 Backend: ExpiredToken`
**Cause:** Your AWS Academy session token expired (~3 hours).

**Fix:**
1. Open AWS Academy lab UI.
2. Click "AWS Details" → "Show" next to AWS CLI credentials.
3. Re-export them in your shell:
   ```bash
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   export AWS_SESSION_TOKEN=...
   ```
4. Re-run `terraform init` / `apply`.
5. **Also update** the same three values in GitHub repo secrets if you'll trigger CI.

---

### `Error: Error acquiring the state lock`
**Cause:** A previous `terraform apply` was killed before unlocking.

**Fix:**
- Check that no one else is running terraform.
- If you're sure, force-unlock with the lock ID from the error message:
  ```bash
  terraform force-unlock <LOCK_ID>
  ```

---

### `Error: creating IAM Role: AccessDenied`
**Cause:** AWS Academy doesn't allow creating new IAM roles.

**Fix:** Use the pre-existing `LabRole`:
```bash
terraform apply -var=use_lab_role=true
```

---

### `Error: InvalidClientTokenId`
**Cause:** Wrong or expired access key.

**Fix:** Refresh AWS credentials (see ExpiredToken above).

---

### `terraform output -raw` returns empty
**Cause:** State exists but the output wasn't computed (apply hasn't run successfully yet).

**Fix:**
```bash
cd infra
terraform refresh -var=use_lab_role=true
terraform output
```

---

## 4. GitHub Actions Pipeline

### Pipeline run fails on `terraform` job with "ExpiredToken"
**Cause:** AWS Academy session token in GitHub secrets is stale (each lab session generates new tokens).

**Fix:**
1. Open AWS Academy → "AWS Details" → copy fresh `aws_access_key_id`, `aws_secret_access_key`, `aws_session_token`.
2. GitHub repo → Settings → Secrets and variables → Actions.
3. Update each of the three secrets.
4. Re-run the failed workflow (Actions tab → click the run → "Re-run all jobs").

---

### `build_push` job fails with "no basic auth credentials"
**Cause:** ECR login step didn't run or failed.

**Fix:** Check the `Login to ECR` step's logs. Usually means AWS creds expired between jobs (rare). Refresh secrets and re-run.

---

### `deploy` job times out waiting for ECS service stability
**Causes:**
- The new task is failing health checks (most common).
- The image pushed to ECR is broken.

**Fix:**
1. Open AWS Console → ECS → cluster → service → Tasks tab.
2. Click the failing task → "Logs" tab.
3. Read the error.
4. Common: missing env var, port mismatch, app crash on startup.

---

### Pipeline says "skipping job" on a PR
**Cause:** `build_push` and `deploy` are gated on `push` to `main`. They don't run on PRs by design.

**Fix:** This is expected. Merge to `main` to trigger a full deploy.

---

### Smoke test fails: `curl: (7) Failed to connect`
**Cause:** ALB DNS hasn't propagated yet, OR target is unhealthy.

**Fix:**
1. Wait 60s (ALB DNS sometimes takes a moment).
2. Check target group health: AWS Console → EC2 → Target Groups → check "healthy" count.
3. If unhealthy, look at ECS task logs (see `deploy job times out` above).

---

## 5. AWS / Live App

### ALB returns `503 Service Temporarily Unavailable`
**Cause:** No healthy targets in the target group.

**Fix:**
1. AWS Console → EC2 → Target Groups → find `shopsmart-tg`.
2. Look at the "Targets" tab — what's the health reason?
3. Common reasons:
   - **"Target failed health checks"** → the app isn't responding to `GET /api/health` with `200`. Check the task logs.
   - **"Registration in progress"** → wait 30 seconds.
   - **"unused: target.NotInUse"** → ECS service has 0 desired tasks. Scale it up:
     ```bash
     aws ecs update-service --cluster shopsmart-cluster --service shopsmart-service --desired-count 1 --region us-east-1
     ```

---

### ECS task keeps stopping right after starting
**Cause:** App crashes on startup.

**Fix:**
1. AWS Console → ECS → cluster → service → Tasks → Stopped tasks tab.
2. Click the task → check "Stopped reason" + the logs.
3. Common causes:
   - Missing env var (check `infra/ecs.tf` `container_definitions.environment`).
   - Wrong image tag (rebuild + push).
   - Container OOM (increase `memory` in task definition).

---

### "Image not found" pulling from ECR
**Cause:** The tag in the task definition doesn't exist in ECR.

**Fix:**
```bash
# List what's actually in ECR
aws ecr list-images --repository-name shopsmart --region us-east-1

# If empty, the build_push job hasn't run successfully.
# Trigger the pipeline.
```

---

### Can't SSH/Exec into running ECS task
**Fix:** Use ECS Exec (must be enabled in task def — it's NOT enabled by default in this project):
```bash
aws ecs execute-command \
  --cluster shopsmart-cluster \
  --task <task-arn> \
  --container shopsmart \
  --interactive \
  --command "/bin/sh"
```
If this errors with "ExecuteCommandAgent is not running", task def needs `enable_execute_command = true`. For a viva, just read the CloudWatch logs instead.

---

## 6. Demo Reset Script

### `Could not read any Terraform outputs`
**Cause:** No infrastructure deployed yet, or `terraform init` hasn't run.

**Fix:**
```bash
cd infra
terraform init
terraform output            # should show ECR URL, ECS names, etc.
```
If outputs are empty, run `terraform apply` first to create the infra.

---

### `AWS credentials missing or expired`
**Fix:** Same as the ExpiredToken fix above. Re-export creds in your shell.

---

### Script ran successfully but ECR still has images
**Cause:** Race condition with another push (CI was running at the same time).

**Fix:** Cancel any in-progress GitHub Actions run (Actions tab → cancel), then re-run the script.

---

### Script ran but ECS service didn't scale to 0
**Cause:** Auto-scaling rules might be re-scaling it up (not configured in this project, but worth knowing).

**Fix:** Disable any service auto-scaling first, then re-run the script.

---

## Still stuck?

1. Check the actual error message — don't paraphrase, copy the full thing.
2. Search the error verbatim. Most AWS / Terraform errors are common and have known fixes.
3. The four logs that solve 90% of issues:
   - **Local dev:** terminal output from `pnpm run dev`
   - **Docker:** `docker compose logs -f`
   - **Pipeline:** GitHub Actions run page → click the failing step
   - **AWS runtime:** CloudWatch → log groups → `/ecs/shopsmart`
