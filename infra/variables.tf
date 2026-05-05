variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project" {
  type    = string
  default = "shopsmart"
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "container_port" {
  type    = number
  default = 5001
}

variable "use_lab_role" {
  description = "If true, use the AWS Academy LabRole instead of creating IAM roles."
  type        = bool
  default     = false
}
