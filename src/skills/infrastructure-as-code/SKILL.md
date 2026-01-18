---
name: Infrastructure as Code
description: Declarative infrastructure with Terraform, Pulumi, and GitOps for reproducible, version-controlled deployments
---

# Infrastructure as Code Skill

Manage infrastructure declaratively through code, enabling reproducibility, version control, and automation.

## Core Principles

- **Declarative**: Describe desired state, not steps
- **Idempotent**: Apply repeatedly with same result
- **Versioned**: Track changes in Git
- **Immutable**: Replace rather than modify resources
- **Modular**: Reusable components

## Terraform

### Project Structure

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── prod/
├── modules/
│   ├── vpc/
│   ├── ecs-service/
│   └── rds/
└── README.md
```

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

### Workspaces

```bash
# Create and switch workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# List workspaces
terraform workspace list

# Switch workspace
terraform workspace select prod

# Use workspace in config
resource "aws_instance" "example" {
  tags = {
    Environment = terraform.workspace
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

### Component Resources

```typescript
// components/EcsService.ts
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface EcsServiceArgs {
  cluster: aws.ecs.Cluster;
  image: pulumi.Input<string>;
  cpu?: number;
  memory?: number;
  desiredCount?: number;
  subnets: pulumi.Input<pulumi.Input<string>[]>;
  securityGroups: pulumi.Input<pulumi.Input<string>[]>;
}

export class EcsService extends pulumi.ComponentResource {
  public readonly service: aws.ecs.Service;
  public readonly taskDefinition: aws.ecs.TaskDefinition;

  constructor(
    name: string,
    args: EcsServiceArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:ecs:Service", name, {}, opts);

    const logGroup = new aws.cloudwatch.LogGroup(
      `${name}-logs`,
      {
        retentionInDays: 7,
      },
      { parent: this },
    );

    this.taskDefinition = new aws.ecs.TaskDefinition(
      `${name}-task`,
      {
        family: name,
        networkMode: "awsvpc",
        requiresCompatibilities: ["FARGATE"],
        cpu: args.cpu?.toString() || "256",
        memory: args.memory?.toString() || "512",
        containerDefinitions: pulumi.interpolate`[{
        "name": "${name}",
        "image": "${args.image}",
        "essential": true,
        "portMappings": [{"containerPort": 8080}],
        "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "${logGroup.name}",
            "awslogs-region": "${aws.config.region}",
            "awslogs-stream-prefix": "ecs"
          }
        }
      }]`,
      },
      { parent: this },
    );

    this.service = new aws.ecs.Service(
      `${name}-service`,
      {
        cluster: args.cluster.arn,
        taskDefinition: this.taskDefinition.arn,
        desiredCount: args.desiredCount || 2,
        launchType: "FARGATE",
        networkConfiguration: {
          subnets: args.subnets,
          securityGroups: args.securityGroups,
          assignPublicIp: true,
        },
      },
      { parent: this },
    );

    this.registerOutputs({
      serviceName: this.service.name,
      taskArn: this.taskDefinition.arn,
    });
  }
}

// Usage
const service = new EcsService("api", {
  cluster,
  image: "nginx:latest",
  subnets: subnetIds,
  securityGroups: [securityGroupId],
});
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

## Best Practices

### Naming Conventions

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

### Security

```hcl
# Encrypted backend
terraform {
  backend "s3" {
    encrypt        = true
    kms_key_id     = var.kms_key_id
  }
}

# Sensitive values
variable "db_password" {
  type      = string
  sensitive = true
}

# Don't commit secrets
resource "aws_secretsmanager_secret_version" "db" {
  secret_id     = aws_secretsmanager_secret.db.id
  secret_string = var.db_password
}
```

### Testing

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

## Quick Reference

**Terraform workflow:**

```bash
terraform init
terraform plan
terraform apply
terraform destroy
```

**Pulumi workflow:**

```bash
pulumi new aws-typescript
pulumi up
pulumi destroy
```

**State operations:**

```bash
terraform state list
terraform state show aws_instance.example
terraform state mv aws_instance.old aws_instance.new
terraform state rm aws_instance.decommissioned
```

## Resources

- Terraform Docs — https://developer.hashicorp.com/terraform
- Pulumi Docs — https://www.pulumi.com/docs/
- ArgoCD — https://argo-cd.readthedocs.io/
- Flux — https://fluxcd.io/
