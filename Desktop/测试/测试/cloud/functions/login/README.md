# Douyin login cloud function

This function exchanges `tt.login` code for an `openid` and issues an app session token.

## Required environment variables

- `DOUYIN_APP_ID`
- `DOUYIN_APP_SECRET`

## Local storage

The sample stores users and sessions in `./.data/users.json`.
Replace this with your real database before production.
