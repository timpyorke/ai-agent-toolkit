# Examples

## Accessing Secrets

### Environment Variables (Local/CI)
```javascript
// .env file
// API_KEY=sk_test_123

require('dotenv').config();

function getApiKey() {
    const key = process.env.API_KEY;
    if (!key) throw new Error("API_KEY not set");
    return key;
}
```

### AWS Secrets Manager (Node.js)
```javascript
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getDatabaseCreds() {
    const response = await client.send(
        new GetSecretValueCommand({ SecretId: "prod/db/main" })
    );
    return JSON.parse(response.SecretString);
}
```

### HashiCorp Vault (CLI)
```bash
# Login
vault login -method=userpass username=myuser

# Read secret
vault kv get -format=json secret/myapp/config | jq .data.data
```

## Leak Prevention

### Pre-commit Hook (Gitleaks)
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/zricethezav/gitleaks
    rev: v8.18.1
    hooks:
      - id: gitleaks
```
