# SoundRewards — Run Guide

## Free Stack
| Layer    | Service            | Free tier |
|----------|--------------------|-----------|
| Frontend | Vercel             | ✅ Free forever |
| Backend  | Railway            | ✅ $5 credit/mo (enough for small apps) |
| Database | MongoDB Atlas      | ✅ 512 MB free cluster |

---

## 1 — Database (MongoDB Atlas — free)
1. Go to https://cloud.mongodb.com → create free account
2. Create a **Free M0 cluster** (AWS, any region)
3. Add a DB user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow all — needed for Railway)
5. Click **Connect → Drivers** and copy the connection string
6. Paste into `backend/.env` as `DB_URL=mongodb+srv://...`

---

## 2 — Run locally

### Backend
```bash
cd backend
npm install
# fill in backend/.env (JWT_SECRET + DB_URL)
npm run dev        # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

Leave `VITE_API_URL` blank in `frontend/.env` — the Vite proxy
will forward all `/api` calls to `http://localhost:5000`.

---

## 3 — Deploy Backend FREE on Railway
1. Go to https://railway.app → sign up with GitHub (free)
2. New Project → **Deploy from GitHub repo** → select your repo
3. Set **Root Directory** to `backend`
4. Add env vars in Railway dashboard:
   - `JWT_SECRET` = any long random string
   - `DB_URL` = your Atlas connection string
   - `CLIENT_URL` = your Vercel frontend URL (after step 4)
5. Railway auto-detects `npm start` — your backend URL will be
   something like `https://soundrewards-backend.up.railway.app`

---

## 4 — Deploy Frontend FREE on Vercel
1. Go to https://vercel.com → sign up with GitHub
2. Import your repo → set **Root Directory** to `frontend`
3. Add env variable in Vercel dashboard:
   - `VITE_API_URL` = your Railway backend URL (from step 3)
4. Deploy — your app is live at `https://soundrewards.vercel.app`

---

## Files fixed in this zip
| File | Status |
|------|--------|
| `frontend/src/components/SharedComponents.jsx` | ✅ Created (Badge, StatCard, CustomTooltip) |
| `frontend/vite.config.js` | ✅ Fixed (React plugin + proxy) |
| `frontend/package.json` | ✅ Created |
| `backend/src/routes/admin.js` | ✅ Filled in |
| `backend/src/routes/music.js` | ✅ Created |
| `backend/src/routes/referral.js` | ✅ Created |
| `backend/src/models/Transaction.js` | ✅ Created |
| `backend/package.json` | ✅ Fixed (all deps added) |
| `backend/.env` | ✅ Template with comments |
| `frontend/.env` | ✅ Template with comments |
