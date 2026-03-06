
# EXAMPLE: DO NOT USE IN PRODUCTION
# This is a demonstration file showing what NOT to do
# Terraform configuration with security issues

provider "aws" {
  region     = "us-west-2"
  # Critical: Hardcoded AWS credentials
  access_key = "AKIAIOSFODNN7EXAMPLE"
  secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  # Medium: Overly permissive security group
  security_groups = ["allow_all"]
  
  # High: Public IP directly assigned
  associate_public_ip_address = true
  
  # Low: Default username and password
  user_data = <<-EOF
              #!/bin/bash
              echo "admin:password" | chpasswd
              EOF
              
  # Low: No encryption for EBS volumes
  ebs_block_device {
    device_name = "/dev/sdf"
    volume_size = 100
    encrypted   = false
  }
  
  tags = {
    Name = "web-server"
  }
}

# High: S3 bucket with public access
resource "aws_s3_bucket" "data" {
  bucket = "example-app-data-bucket"
  acl    = "public-read"
  
  # Medium: Logging disabled
  logging {
    target_bucket = ""
    target_prefix = ""
  }
}

# Medium: Unencrypted RDS instance
resource "aws_db_instance" "default" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t2.micro"
  name                 = "mydb"
  username             = "admin"
  password             = "foobarbaz"
  parameter_group_name = "default.mysql5.7"
  skip_final_snapshot  = true
  publicly_accessible  = true
  storage_encrypted    = false
}
