# Reference Material

## Core Principles

### 1. Declarative
- Describe desired state, not steps.
- The tool figures out how to reach that state.

### 2. Idempotent
- Apply repeatedly with same result.
- Running the script twice shouldn't create duplicate resources.

### 3. Versioned
- Track changes in Git.
- Infrastructure behaves like software.

### 4. Immutable
- Replace rather than modify resources (where possible).
- Reduces configuration drift and "snowflake" servers.

### 5. Modular
- Reusable components (Terraform Modules, Pulumi Components).
- DRY (Don't Repeat Yourself) principle.

## Quick Reference

### Terraform Workflow
```bash
terraform init
terraform plan
terraform apply
terraform destroy
```

### Pulumi Workflow
```bash
pulumi new aws-typescript
pulumi up
pulumi destroy
```

### State Operations
```bash
terraform state list
terraform state show aws_instance.example
terraform state mv aws_instance.old aws_instance.new
terraform state rm aws_instance.decommissioned
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
```

## Best Practices

### Security
- **Encrypted backend**: Always encrypt state files (contains secrets).
- **Sensitive inputs**: Mark variables as sensitive.
- **External secrets**: Use valid secrets managers (AWS Secrets Manager, Vault) instead of hardcoding.

### Structure
- **Environment Isolation**: Separate state files for dev/staging/prod.
- **Remote State**: Never store state locally for team projects.
- **Locking**: Use DynamoDB (AWS) or similar for state locking to prevent concurrent edits.

## Resources
- [Terraform Docs](https://developer.hashicorp.com/terraform)
- [Pulumi Docs](https://www.pulumi.com/docs/)
- [ArgoCD](https://argo-cd.readthedocs.io/)
- [Flux](https://fluxcd.io/)
