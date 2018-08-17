pixlack
============

Slack notification on new post by pixiv following users

## Deploy

Put `.env.yaml` and set following environment variables.

```yaml
PIXLACK_SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/..."
PIXLACK_USERNAME: "<PIXIV_USERNAME_HERE>"
PIXLACK_PASSWORD: "<PIXIV_PASSWORD_HERE>"
```

Then deploy it!

```sh
gcloud beta functions deploy pixlack --runtime nodejs8 --trigger-http --env-vars-file .env.yaml --region asia-northeast1
```
