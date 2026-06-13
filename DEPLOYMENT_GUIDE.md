# 🚀 Deployment Guide - Sticker Shop

Your project is a **Next.js + Supabase** app. Here are the best deployment options:

---

## 🥇 Option 1: **Vercel** (RECOMMENDED - Easiest)

Vercel is made by the creators of Next.js. **Free tier available.**

### Step 1: Prepare Your Code
```bash
# Make sure everything is committed to Git
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Push to GitHub
1. If not already on GitHub:
   - Create account at https://github.com
   - Create new repo named `sticker-shop`
   - Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sticker-shop.git
   git branch -M main
   git push -u origin main
   ```

2. If already on GitHub, just make sure latest code is pushed

### Step 3: Deploy on Vercel
1. Go to https://vercel.com
2. Sign up with GitHub account
3. Click **"New Project"**
4. Select your `sticker-shop` repository
5. Vercel auto-detects it's a Next.js project ✅

### Step 4: Add Environment Variables
Before deploying, add your Supabase credentials:

1. In Vercel dashboard, go to **Settings → Environment Variables**
2. Add these variables (copy from your `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_key
   ```
3. Click **Deploy**

✅ **That's it!** Your app is live at `https://sticker-shop.vercel.app`

**Cost:** FREE for hobby projects (includes 100GB bandwidth/month)

---

## 🟢 Option 2: **Netlify** (Also Easy)

Good alternative with similar setup.

### Step 1: Connect Repository
1. Go to https://netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your `sticker-shop` repo

### Step 2: Configure Build Settings
- Build command: `npm run build`
- Publish directory: `.next`

### Step 3: Add Environment Variables
1. **Settings → Build & Deploy → Environment**
2. Add same variables as Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

### Step 4: Deploy
Netlify automatically starts building!

✅ **Live at:** `https://your-site.netlify.app`

**Cost:** FREE for hobby projects

---

## 🚢 Option 3: **Railway** (Simple & Affordable)

Great for full control with simple setup.

### Step 1: Connect GitHub
1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your `sticker-shop` repo

### Step 2: Add Environment Variables
1. Click on your project
2. **Variables** tab
3. Add Supabase credentials

### Step 3: Deploy
```bash
# Or deploy via CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

✅ **Live at:** Your Railway domain (shown in dashboard)

**Cost:** $5/month credit, pay-as-you-go after that

---

## ☁️ Option 4: **Other Hosting** (AWS, DigitalOcean, etc.)

For self-hosted options:

### Build & Deploy Anywhere
```bash
# Build your Next.js app
npm run build

# Start production server
npm start
```

This works on any server that supports Node.js 18+

---

## ✅ Verification Checklist Before Deploying

- [ ] `.env.local` has correct Supabase URL & Key
- [ ] All code is committed to Git (`git status` shows clean)
- [ ] Run `npm run build` locally - no errors
- [ ] Test locally: `npm run dev` works
- [ ] RLS policies are fixed in Supabase (allow INSERT)
- [ ] Test appointments are showing in `/admin`

---

## 🔒 Environment Variables

**DO NOT commit .env.local to Git!**

It's already in `.gitignore` ✅

When deploying:
- Add `NEXT_PUBLIC_SUPABASE_URL` 
- Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are public, safe to expose. Don't add any secret keys.

---

## 📝 Post-Deployment

After deploying:

1. **Test your live site:**
   - Go to booking page: `/book`
   - Go to admin: `/admin`
   - Try booking an appointment

2. **Set up custom domain** (optional):
   - Vercel: Settings → Domains
   - Netlify: Settings → Domain Management
   - Example: `stickershop.com` instead of `vercel.app`

3. **Enable HTTPS** (automatic on all platforms) ✅

---

## 🆘 Troubleshooting

**"Appointments not showing on live site?"**
- Check Environment Variables are set correctly
- Verify Supabase RLS policies allow INSERT/SELECT
- Run: `node test-appointments.js` to verify connection

**"Build fails during deployment?"**
- Check build logs in Vercel/Netlify dashboard
- Run `npm run build` locally first to catch errors
- Make sure all dependencies are in `package.json`

**"Cannot connect to Supabase?"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Check it doesn't have quotes: should be just the URL
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not truncated

---

## 🎯 Recommended Path

1. **Use Vercel** (easiest for Next.js)
2. **Push code to GitHub** (required for all options)
3. **Set env variables** in Vercel dashboard
4. **Test live site** - booking form + admin dashboard
5. **Done!** 🎉

Need help with any step? Let me know!
