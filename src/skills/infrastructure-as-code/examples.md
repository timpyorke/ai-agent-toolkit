# Examples

## Terraform

### Basic Configuration
```hcl
# main.tf
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.environment}-vpc"
  }
}

# Subnets
resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.environment}-public-${count.index + 1}"
  }
}
```

### Variables and Outputs
```hcl
# variables.tf
variable "environment" {
  description = "Environment name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

# outputs.tf
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}
```

### Modules
```hcl
# modules/ecs-service/main.tf
variable "cluster_id" { type = string }
variable "service_name" { type = string }
variable "image" { type = string }
variable "cpu" { type = number; default = 256 }
variable "memory" { type = number; default = 512 }
variable "desired_count" { type = number; default = 2 }

resource "aws_ecs_task_definition" "app" {
  family                   = var.service_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory

  container_definitions = jsonencode([{
    name      = var.service_name
    image     = var.image
    essential = true
    portMappings = [{
      containerPort = 8080
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.service_name}"
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "app" {
  name            = var.service_name
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.security_group_id]
    assign_public_ip = true
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

output "service_name" {
  value = aws_ecs_service.app.name
}
```

### State Management
```hcl
# Remote backend with locking
terraform {
  backend "s3" {
    bucket         = "terraform-state-bucket"
    key            = "env/prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
    kms_key_id     = "arn:aws:kms:us-east-1:ACCOUNT:key/KEY-ID"
  }
}
```

## Pulumi

### TypeScript Project
```typescript
// index.ts
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const environment = pulumi.getStack();

// VPC
const vpc = new aws.ec2.Vpc("main", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: `${environment}-vpc`,
    Environment: environment,
  },
});

// Subnets
const azs = aws.getAvailabilityZones({ state: "available" });
const publicSubnets = azs.then((zones) =>
  zones.names.slice(0, 3).map(
    (az, i) =>
      new aws.ec2.Subnet(`public-${i}`, {
        vpcId: vpc.id,
        cidrBlock: `10.0.${i}.0/24`,
        availabilityZone: az,
        mapPublicIpOnLaunch: true,
        tags: { Name: `${environment}-public-${i}` },
      }),
  ),
);

// ECS Cluster
const cluster = new aws.ecs.Cluster("app-cluster", {
  name: `${environment}-cluster`,
});

// Export outputs
export const vpcId = vpc.id;
export const clusterId = cluster.id;
export const subnetIds = pulumi
  .all(publicSubnets)
  .apply((subnets) => subnets.map((s) => s.id));
```

## GitOps

### ArgoCD Application
```yaml
# argocd/applications/api.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/repo.git
    targetRevision: main
    path: k8s/api
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Flux Kustomization
```yaml
# clusters/production/api.yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: api
  namespace: flux-system
spec:
  interval: 5m
  path: ./k8s/api
  prune: true
  sourceRef:
    kind: GitRepository
    name: repo
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: api
      namespace: production
  timeout: 2m
```

## Naming Conventions
```hcl
# Consistent naming
resource "aws_s3_bucket" "data" {
  bucket = "${var.environment}-${var.project}-data-${random_id.suffix.hex}"
}

# Tags
locals {
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "Terraform"
    Repository  = "github.com/org/repo"
  }
}
```

## Testing
```bash
# Validate syntax
terraform validate

# Format code
terraform fmt -recursive

# Plan before apply
terraform plan -out=plan.tfplan

# Review plan
terraform show plan.tfplan

# Apply with plan
terraform apply plan.tfplan
```
