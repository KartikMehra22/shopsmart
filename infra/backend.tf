terraform {
  backend "s3" {
    bucket  = "shopsmart-tfstate-df62308f"
    key     = "shopsmart/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
