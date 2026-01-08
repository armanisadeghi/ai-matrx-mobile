# Environment Configuration

## Required Environment Variables

The AI Matrx mobile app requires Supabase configuration to work properly.

### 1. Create .env File

Create a `.env` file in the project root:

```bash
cd ~/ai-matrx-mobile
touch .env
```

### 2. Add Supabase Credentials

Add the following to your `.env` file:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Get Your Supabase Credentials

**If you already have a Supabase project:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to Settings → API
4. Copy:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**If you need to create a new project:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for setup to complete
4. Follow steps above to get credentials

### 4. Verify Configuration

After adding the `.env` file:

```bash
# Restart the dev server
pnpm start
```

The app should now be able to connect to Supabase.

---

## Optional Environment Variables

You can add additional API keys if needed:

```env
# Optional: AI API Keys (if using AI features)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key_here
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key_here
```

---

## Security Notes

- ✅ `.env` is in `.gitignore` (not committed to git)
- ✅ Uses `EXPO_PUBLIC_` prefix (required for Expo)
- ✅ Tokens stored securely with `expo-secure-store`
- ⚠️ Never commit `.env` file to version control
- ⚠️ Never share your Supabase keys publicly

---

## Troubleshooting

### "Cannot read property 'EXPO_PUBLIC_SUPABASE_URL' of undefined"

**Solution:** Create `.env` file with Supabase credentials

### Changes to .env not taking effect

**Solution:** Restart the dev server
```bash
# Stop current server (Ctrl+C)
pnpm start
```

### "Invalid API key" or authentication errors

**Solution:** Verify your Supabase credentials are correct
- Check Project URL matches exactly
- Check anon key is the `anon` `public` key, not the service role key
- Ensure no extra spaces or quotes in `.env` file

---

## Example .env File

```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzQ1Njc4OSwiZXhwIjoxOTM5MDMyNzg5fQ.abcdefghijklmnopqrstuvwxyz1234567890
```

**Note:** Replace with your actual credentials from Supabase dashboard.
