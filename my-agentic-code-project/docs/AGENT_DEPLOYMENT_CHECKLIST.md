# Agent Deployment Checklist

Use this checklist before deploying any agent to production. Based on best practices from:
- Claude_Code_Agentic_Workflows_Guide.md Part 6 & 9
- CRAFT_Prompt_Engineering_Guide_for_Claude.md

---

## Pre-Deployment Validation

Before considering an agent ready for production, verify every item below.

### Code Quality

- [ ] **Error Handling**
  - [ ] All external API calls wrapped in try/except
  - [ ] Specific exception types caught (not bare `except:`)
  - [ ] Meaningful error messages logged
  - [ ] Graceful degradation where possible
  - Location: Check all `agents/*.py` files

- [ ] **Retry Logic**
  - [ ] Exponential backoff implemented for transient failures
  - [ ] Max retry attempts specified with timeout
  - [ ] Rate limit detection and handling
  - [ ] Jitter added to prevent thundering herd
  - Reference: Part 6 of agentic workflows guide

- [ ] **Input Validation**
  - [ ] User/external input validated at system boundaries
  - [ ] Type checking performed
  - [ ] Required fields validated
  - [ ] Length/format constraints enforced

- [ ] **Code Documentation**
  - [ ] Docstrings on all public methods
  - [ ] Confidence levels noted (HIGH/MEDIUM/LOW)
  - [ ] Parameters and return values documented
  - [ ] Non-obvious logic has inline comments
  - [ ] Assumptions listed in docstrings

- [ ] **No Hardcoded Secrets**
  - [ ] No API keys in source code
  - [ ] No passwords in comments
  - [ ] No tokens in git history
  - [ ] All credentials loaded from environment

### State Management & Persistence

- [ ] **State Storage**
  - [ ] State stored in files or database (not just memory)
  - [ ] State file format documented
  - [ ] Recovery procedure if state is corrupted
  - [ ] State location specified in config
  - Reference: Part 6, Class AgentState example

- [ ] **State Tracking**
  - [ ] Last execution timestamp recorded
  - [ ] Success/failure counts maintained
  - [ ] Processing progress tracked
  - [ ] State persisted after each operation

- [ ] **Idempotency**
  - [ ] Operations are idempotent (safe to retry)
  - [ ] Duplicate processing prevented
  - [ ] Message deduplication implemented
  - [ ] State recovery won't cause re-processing

### Logging & Monitoring

- [ ] **Structured Logging**
  - [ ] Logs include timestamps
  - [ ] Log levels used appropriately (INFO/WARNING/ERROR)
  - [ ] Contextual information included (operation ID, user, etc.)
  - [ ] Log format consistent across agent
  - Reference: Part 6, setup_agent_logger() example

- [ ] **Log Rotation**
  - [ ] Log files rotate on size (10MB default)
  - [ ] Old logs archived or deleted
  - [ ] Backup count configured (5-10 files)
  - [ ] Log directory excluded from git (.gitignore)

- [ ] **Log Content**
  - [ ] No sensitive data in logs (API keys, tokens, passwords)
  - [ ] No personally identifiable information
  - [ ] Errors include stack traces
  - [ ] Important operations logged at INFO level

- [ ] **Monitoring Points**
  - [ ] Agent startup logged
  - [ ] External API calls logged (without credentials)
  - [ ] Errors and retries logged
  - [ ] Agent completion/exit logged
  - [ ] Performance metrics captured

### Security

- [ ] **Credential Management**
  - [ ] All secrets in environment variables or .env files
  - [ ] .env file exists and is in .gitignore
  - [ ] No secrets in version control history
  - [ ] Credentials validated on startup
  - [ ] Clear error if required credentials missing

- [ ] **OAuth/API Credentials**
  - [ ] OAuth scopes minimized to required permissions only
  - [ ] Token refresh handled if applicable
  - [ ] Expired token detection and re-authentication
  - [ ] Token file permissions restricted (chmod 600)
  - [ ] Token file excluded from git

- [ ] **API Security**
  - [ ] HTTPS used for all external calls
  - [ ] SSL verification enabled (not disabled)
  - [ ] Rate limiting respected
  - [ ] User-Agent header set appropriately
  - [ ] No sensitive data in URL parameters

- [ ] **Audit Logging**
  - [ ] Sensitive operations logged with full context
  - [ ] User/agent identity included in audit logs
  - [ ] Timestamp, action, result recorded
  - [ ] Audit logs retained per compliance requirements
  - [ ] Audit logs separated from operational logs

### Testing & Validation

- [ ] **Unit Tests**
  - [ ] Critical paths have tests
  - [ ] Mocking used for external API calls
  - [ ] Error cases tested (connection failure, timeout, etc.)
  - [ ] Edge cases covered
  - [ ] Tests run and pass

- [ ] **Integration Testing**
  - [ ] Real API calls tested in staging environment
  - [ ] Authentication tested end-to-end
  - [ ] Rate limiting handling tested
  - [ ] Timeout behavior tested
  - [ ] State persistence tested across runs

- [ ] **Error Path Testing**
  - [ ] Network timeout handling tested
  - [ ] Invalid credential handling tested
  - [ ] Rate limit recovery tested
  - [ ] State corruption recovery tested
  - [ ] Graceful shutdown tested

- [ ] **Load Testing**
  - [ ] Agent handles expected volume
  - [ ] Performance acceptable under load
  - [ ] Memory usage doesn't grow unboundedly
  - [ ] File handles properly closed
  - [ ] Connection pools managed correctly

### External API Integration

- [ ] **Gmail MCP** (if used)
  - [ ] OAuth token obtained and refreshed
  - [ ] Scopes verified (see Part 3 of guide)
  - [ ] Unread email fetching tested
  - [ ] Label application tested
  - [ ] Email sending tested
  - [ ] Rate limits understood and respected

- [ ] **GitHub Actions MCP** (if used)
  - [ ] GitHub PAT obtained with correct scopes
  - [ ] Workflow triggering tested
  - [ ] Status polling tested
  - [ ] Artifact retrieval tested
  - [ ] Log fetching tested
  - [ ] API rate limits understood

- [ ] **Custom MCPs/APIs**
  - [ ] Authentication tested
  - [ ] Error responses handled
  - [ ] Timeout values set appropriately
  - [ ] Retry logic handles API errors
  - [ ] Rate limiting respected

### Configuration & Environment

- [ ] **Configuration Files**
  - [ ] agent-config.yaml created and documented
  - [ ] All required config values present
  - [ ] Config validated on startup
  - [ ] Example config file provided
  - [ ] Secrets separated from config

- [ ] **.env Setup**
  - [ ] .env.template created with all required variables
  - [ ] Instructions provided for obtaining credentials
  - [ ] Default values documented (where safe)
  - [ ] Validation error messages clear
  - [ ] No sensitive data in template

- [ ] **File Permissions**
  - [ ] Config files readable by agent
  - [ ] Log directory writable by agent
  - [ ] State files readable/writable
  - [ ] Token files with restricted permissions (600)
  - [ ] Project directory structure correct

### Documentation

- [ ] **Setup Instructions**
  - [ ] Step-by-step setup documented
  - [ ] Prerequisites listed (Python version, dependencies, etc.)
  - [ ] Installation instructions clear
  - [ ] Configuration setup instructions provided
  - [ ] Credential setup documented

- [ ] **Configuration Examples**
  - [ ] Example .env file provided
  - [ ] Example agent-config.yaml provided
  - [ ] Example MCP configurations included
  - [ ] Comments explain what each setting does

- [ ] **Common Issues Documentation**
  - [ ] Authentication failures and solutions documented
  - [ ] Rate limiting issues and recovery documented
  - [ ] Timeout issues and fixes documented
  - [ ] State corruption and recovery documented
  - [ ] Common error messages and resolutions

- [ ] **Runbook for Failures**
  - [ ] How to check if agent is running
  - [ ] Where to find logs
  - [ ] How to diagnose issues
  - [ ] How to manually recover from failures
  - [ ] Escalation path defined
  - [ ] On-call contact information

- [ ] **Architecture Documentation**
  - [ ] Agent design explained
  - [ ] State flow documented
  - [ ] External dependencies listed
  - [ ] Failure modes identified
  - [ ] Recovery strategies documented

### Deployment

- [ ] **Credentials Validation**
  - [ ] All API keys and tokens valid
  - [ ] Credentials rotated before deployment
  - [ ] Token expiration dates checked
  - [ ] OAuth refresh tokens present
  - [ ] Staging credentials are not production credentials

- [ ] **Permission Verification**
  - [ ] OAuth scopes minimal and verified
  - [ ] API keys have appropriate limits
  - [ ] GitHub PAT has correct scopes
  - [ ] Gmail token has required scopes
  - [ ] No overpermissioned credentials

- [ ] **Resource Planning**
  - [ ] Disk space for logs estimated
  - [ ] Memory requirements documented
  - [ ] CPU requirements estimated
  - [ ] Network bandwidth estimated
  - [ ] Database/state storage sized appropriately

- [ ] **Monitoring Setup**
  - [ ] Log monitoring configured
  - [ ] Error rate alerts set up
  - [ ] Success rate metrics defined
  - [ ] Performance metrics tracked
  - [ ] On-call notification channel ready

- [ ] **Runbook Validation**
  - [ ] Runbook tested in staging
  - [ ] Recovery procedures verified
  - [ ] Escalation path clear
  - [ ] Team trained on runbook
  - [ ] Communication templates prepared

### Human Oversight

- [ ] **Review Gates**
  - [ ] Code reviewed by another developer
  - [ ] Security review completed
  - [ ] Architecture review approved
  - [ ] Operations review completed
  - [ ] Stakeholder sign-off obtained

- [ ] **Escalation Planning**
  - [ ] Criteria for escalating to human review defined
  - [ ] Critical operation thresholds set
  - [ ] Failure notification process defined
  - [ ] Manual intervention procedures documented
  - [ ] Approval process for high-risk operations

---

## Sign-Off

Agent Name: ________________________

Version: ________________________

Deployment Date: ________________________

Checklist Completed By: ________________________ (Name/Date)

Code Reviewed By: ________________________ (Name/Date)

Operations Approved By: ________________________ (Name/Date)

---

## Notes

Use this section to document any exceptions, known issues, or special deployment instructions:

```
[Your notes here]
```

---

## Post-Deployment Validation (First Week)

After deploying, verify:

- [ ] Agent runs without errors for 24 hours
- [ ] Logs are clean (no unexpected errors)
- [ ] State persists correctly across runs
- [ ] Error handling works as expected
- [ ] Rate limiting respected
- [ ] No credential leaks in logs
- [ ] Monitoring alerts functioning
- [ ] Team comfortable with runbook

---

**Last Updated**: January 17, 2026
**Version**: 1.0
**Based On**: Claude_Code_Agentic_Workflows_Guide.md Parts 6 & 9
