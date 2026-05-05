provider "aws" {
  region = var.aws_region
}

resource "random_id" "suffix" {
  byte_length = 4
}

data "aws_caller_identity" "current" {}

locals {
  name       = var.project
  account_id = data.aws_caller_identity.current.account_id

  execution_role_arn = var.use_lab_role ? "arn:aws:iam::${local.account_id}:role/LabRole" : aws_iam_role.execution[0].arn
  task_role_arn      = var.use_lab_role ? "arn:aws:iam::${local.account_id}:role/LabRole" : aws_iam_role.task[0].arn

  tags = {
    Project   = var.project
    ManagedBy = "terraform"
  }
}
