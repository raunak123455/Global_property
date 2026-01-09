# Cron Job Setup Guide - Keep Backend Active

## 🎯 API Endpoint for Cron Job

### Ping Endpoint

```
GET https://your-backend-url.com/api/ping
```

**Replace `your-backend-url.com` with your actual deployed backend URL** (e.g., Render, Heroku, Railway, etc.)

### Response

```json
{
  "status": "success",
  "message": "Server is active",
  "timestamp": "2025-11-19T10:30:00.000Z",
  "uptime": 12345.67
}
```

---

## 🔧 Popular Cron Job Services Setup

### Option 1: **cron-job.org** (Recommended - Free & Easy)

**Website:** https://cron-job.org

**Setup Steps:**

1. Create a free account at cron-job.org
2. Click "Create Cronjob"
3. Enter the following details:

#### Configuration:

```
Title: Keep Backend Active
URL: https://your-backend-url.com/api/ping
Request Method: GET
Schedule: Every 14 minutes (*/14 * * * *)
Timeout: 30 seconds
```

**Why 14 minutes?** Most free hosting services (like Render) put apps to sleep after 15 minutes of inactivity. Running every 14 minutes keeps it active.

#### Advanced Settings (Optional):

- **Expected Response Code:** 200
- **Enable Notifications:** Yes (get alerts if your server is down)
- **Save Failed Responses:** Yes

---

### Option 2: **UptimeRobot** (Free - 50 monitors)

**Website:** https://uptimerobot.com

**Setup Steps:**

1. Sign up for free account
2. Click "Add New Monitor"
3. Enter the following:

#### Configuration:

```
Monitor Type: HTTP(s)
Friendly Name: Backend Keep-Alive
URL: https://your-backend-url.com/api/ping
Monitoring Interval: Every 5 minutes (Free tier allows 5 min minimum)
```

#### Alert Contacts:

- Add your email for downtime notifications

---

### Option 3: **EasyCron** (Free tier available)

**Website:** https://www.easycron.com

**Setup Steps:**

1. Register for free account
2. Create new cron job

#### Configuration:

```
URL: https://your-backend-url.com/api/ping
Cron Expression: */14 * * * * (every 14 minutes)
HTTP Method: GET
Time Zone: Your timezone
Execution Time: Enable (to see when job runs)
```

---

### Option 4: **Custom Cron Job using GitHub Actions** (100% Free)

Create `.github/workflows/keep-alive.yml` in your repository:

```yaml
name: Keep Backend Alive

on:
  schedule:
    # Runs every 14 minutes
    - cron: "*/14 * * * *"
  workflow_dispatch: # Allows manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -X GET https://your-backend-url.com/api/ping
          echo "Backend pinged successfully at $(date)"
```

---

## 📊 Cron Schedule Expressions

| Schedule         | Expression     | Use Case                                           |
| ---------------- | -------------- | -------------------------------------------------- |
| Every 5 minutes  | `*/5 * * * *`  | Maximum activity (not recommended, overkill)       |
| Every 10 minutes | `*/10 * * * *` | High activity                                      |
| Every 14 minutes | `*/14 * * * *` | **Recommended** - Prevents sleep on most platforms |
| Every 15 minutes | `*/15 * * * *` | Might be too slow for some services                |
| Every 30 minutes | `*/30 * * * *` | Light activity (server will sleep on free tiers)   |

---

## 🚀 Quick Start (Copy & Paste)

### For cron-job.org:

```
URL: https://your-backend-url.com/api/ping
Schedule: */14 * * * *
Method: GET
```

### For UptimeRobot:

```
URL: https://your-backend-url.com/api/ping
Interval: 5 minutes
Type: HTTP(s)
```

---

## ✅ Testing Your Setup

1. **Test the endpoint manually:**

   ```bash
   curl https://your-backend-url.com/api/ping
   ```

2. **Expected response:**

   ```json
   {
     "status": "success",
     "message": "Server is active",
     "timestamp": "2025-11-19T10:30:00.000Z",
     "uptime": 12345.67
   }
   ```

3. **Check your cron job logs** to ensure it's running successfully

---

## 📝 Important Notes

1. **Replace the URL:** Make sure to replace `your-backend-url.com` with your actual deployed backend URL
2. **Free Tier Limits:** Most services offer free tiers but have limits:
   - Render Free: Goes to sleep after 15 min of inactivity, has monthly runtime hours limit
   - Heroku Free: Discontinued (use Render, Railway, or Fly.io instead)
3. **Monitor Your Usage:** Check your cron job service dashboard regularly
4. **Enable Notifications:** Set up email/SMS alerts for downtime

---

## 🛠️ Troubleshooting

### Problem: Cron job shows "Failed" status

**Solution:**

- Check if your backend URL is correct
- Ensure your backend is deployed and accessible
- Verify the `/api/ping` endpoint returns 200 status

### Problem: Backend still goes to sleep

**Solution:**

- Reduce the interval to 10-12 minutes
- Check your hosting platform's specific sleep policy
- Consider upgrading to a paid hosting tier

### Problem: Too many requests warning

**Solution:**

- Increase interval to 15-20 minutes
- Check if you have multiple cron jobs hitting the same endpoint

---

## 🎉 You're All Set!

Your backend will now stay active and respond quickly to user requests. The cron job will ping your server regularly to prevent it from going to sleep.

