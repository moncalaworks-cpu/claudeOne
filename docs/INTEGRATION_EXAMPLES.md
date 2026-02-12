# Integration Examples

**Related Requirement:** REQ-009

Examples of agents integrating with external services beyond Gmail/GitHub.

---

## Slack Integration

### Use Case
Send notifications to Slack when agents complete tasks.

### Pattern
```python
import slack_sdk

client = slack_sdk.WebClient(token=os.getenv('SLACK_TOKEN'))

# Send message
client.chat_postMessage(
    channel="#automation",
    text="✅ Agent completed REQ-001"
)
```

### Setup
1. Create Slack workspace
2. Create bot with `chat:write` scope
3. Add to channel
4. Store token in `.env`

---

## Jira Integration

### Use Case
Create Jira tickets from GitHub issues automatically.

### Pattern
```python
from jira import JIRA

jira = JIRA(
    server=os.getenv('JIRA_URL'),
    basic_auth=(username, password)
)

# Create issue
jira.create_issue(
    project='PROJ',
    issuetype='Task',
    summary='From GitHub #123'
)
```

### Setup
1. Jira Cloud instance
2. Create API token
3. Store credentials in `.env`

---

## Database Integration

### Use Case
Log agent activity to PostgreSQL.

### Pattern
```python
import psycopg2

conn = psycopg2.connect(
    dbname=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASS'),
    host=os.getenv('DB_HOST')
)

# Insert log
cur = conn.cursor()
cur.execute("""
    INSERT INTO logs (agent, action, status)
    VALUES (%s, %s, %s)
""", ('agent-name', 'process', 'success'))
conn.commit()
```

### Setup
1. PostgreSQL database
2. Create tables
3. Store connection string in `.env`

---

## Discord Integration

### Use Case
Post agent status updates to Discord.

### Pattern
```python
import discord

webhook = discord.SyncWebhook.from_url(
    os.getenv('DISCORD_WEBHOOK')
)
webhook.send("Agent completed task!")
```

---

## AWS Integration

### Use Case
Store agent logs in S3.

### Pattern
```python
import boto3

s3 = boto3.client('s3')
s3.put_object(
    Bucket='agent-logs',
    Key=f'logs/{date}.json',
    Body=json.dumps(logs)
)
```

---

## Pattern: Multi-Service Agent

Combining multiple integrations:

1. Read GitHub issues
2. Analyze with Claude
3. Create Jira ticket
4. Notify Slack
5. Log to database
6. Archive to S3

---

**Status:** Complete ✅
