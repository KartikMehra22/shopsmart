data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  count              = var.use_lab_role ? 0 : 1
  name               = "${local.name}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
  tags               = local.tags
}

resource "aws_iam_role_policy_attachment" "execution_managed" {
  count      = var.use_lab_role ? 0 : 1
  role       = aws_iam_role.execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task" {
  count              = var.use_lab_role ? 0 : 1
  name               = "${local.name}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
  tags               = local.tags
}

data "aws_iam_policy_document" "task_s3_read" {
  statement {
    actions   = ["s3:GetObject", "s3:ListBucket"]
    resources = [aws_s3_bucket.app.arn, "${aws_s3_bucket.app.arn}/*"]
  }
}

resource "aws_iam_role_policy" "task_s3_read" {
  count  = var.use_lab_role ? 0 : 1
  name   = "${local.name}-task-s3-read"
  role   = aws_iam_role.task[0].id
  policy = data.aws_iam_policy_document.task_s3_read.json
}
