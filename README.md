pixlack
============

Slack notification on new post by pixiv following users

## Deploy

Put `.secrets.yaml` and set following environment variables.

```yaml
env_variables:
  PIXLACK_SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/..."
  PIXLACK_USERNAME: "<PIXIV_USERNAME_HERE>"
  PIXLACK_PASSWORD: "<PIXIV_PASSWORD_HERE>"
```

Then deploy it!

```sh
gcloud app deploy 
```
