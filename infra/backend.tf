terraform {
  backend "s3" {
    bucket  = "shopsmart-tfstate-PLACEHOLDER"
    key     = "shopsmart/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
