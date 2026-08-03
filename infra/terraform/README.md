# Infraestrutura como código (Terraform) — esboço

> Estado: **esboço**. Nenhum `.tf` foi versionado ainda — este documento define a
> estrutura acordada para o épico de infraestrutura (S0/S5 do roadmap).

## Princípios

1. **Nada de segredo em código.** Valores sensíveis vivem no AWS Secrets Manager /
   SSM Parameter Store e são referenciados por ARN. `*.tfvars` está no `.gitignore`.
2. **Estado remoto e travado.** Backend S3 + DynamoDB para lock, criptografado com KMS.
3. **Um workspace por ambiente:** `dev`, `staging`, `prod`. Nenhum recurso compartilhado
   entre produção e ambientes inferiores.
4. **Residência de dados no Brasil.** Região padrão `sa-east-1` (São Paulo) para todo
   recurso que armazene dado pessoal. `TODO [LEGAL]`
5. **Least privilege.** Uma role por serviço; nenhuma policy com `*` em recurso.

## Estrutura planejada

```
infra/terraform/
  backend.tf              # S3 + DynamoDB lock
  providers.tf            # aws ~> 5.x, região por variável
  variables.tf
  environments/
    dev.tfvars.example
    staging.tfvars.example
    prod.tfvars.example
  modules/
    network/              # VPC, subnets públicas/privadas, NAT, VPC endpoints
    database/             # RDS PostgreSQL 16 Multi-AZ, criptografia KMS, PITR
    cache/                # ElastiCache Redis (rate limit + BullMQ)
    api/                  # ECS Fargate service, task definition, autoscaling
    edge/                 # ALB + WAF (regras OWASP + rate limit L7) + ACM
    secrets/              # Secrets Manager, rotação, políticas de acesso
    observability/        # CloudWatch, alarmes P1/P2, dashboards
    backup/               # AWS Backup, bucket WORM (Object Lock) da auditoria
```

## Recursos por ambiente (alvo)

| Módulo      | dev                     | staging         | prod                       |
| ----------- | ----------------------- | --------------- | -------------------------- |
| ECS Fargate | 1 tarefa, 0.25 vCPU     | 2 tarefas       | 2–10 tarefas (autoscaling) |
| RDS         | db.t4g.micro, Single-AZ | db.t4g.small    | db.t4g.medium **Multi-AZ** |
| Redis       | cache.t4g.micro         | cache.t4g.micro | cache.t4g.small Multi-AZ   |
| Backup      | 7 dias                  | 14 dias         | 35 dias + PITR             |
| WAF         | desligado               | ligado (count)  | ligado (block)             |

## Alarmes obrigatórios em produção

- Falha de notificação de pânico > 5% em 5 min → **P1**
- `POST /panic` p95 > 1 s por 10 min → P2
- Profundidade da fila > 500 → P2
- CPU do RDS > 80% por 10 min · conexões > 80% do limite
- Erros 5xx da API > 1% em 5 min

## Comandos (quando os módulos existirem)

```bash
cd infra/terraform
terraform init -backend-config=environments/dev.backend
terraform workspace select dev
terraform plan  -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

## Pendências

- [ ] Escrever os módulos acima (épico "Infra & CI/CD" do backlog)
- [ ] Definir política de rotação automática do `JWT_SECRET` (janela de dupla validação)
- [ ] Object Lock no bucket de auditoria em modo _compliance_ com retenção definida `TODO [LEGAL]`
- [ ] Habilitar GuardDuty, CloudTrail multi-região e AWS Config
