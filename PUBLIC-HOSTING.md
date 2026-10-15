# Share requests across different networks

For requests from phones on mobile data or another Wi-Fi network to appear on the laptop admin dashboard, both devices must use the same hosted website and cloud database. The local laptop server cannot receive requests over the public internet.

## Setup

1. Create a Supabase project.
2. Run the complete `supabase-setup.sql` file in that project's SQL Editor.
3. In Supabase Authentication, create an admin user with email `mrmadileng07@gmail.com` and set a password. The password is the Supabase account password; the dashboard also asks for the competition PIN `1504`.
4. In **Project Settings → API Keys**, copy the **Project URL** and **Publishable key**. Set them in `backend-config.js`:

   ```js
   window.ROADRESCUE_CONFIG = {
     localServerMode: true,
     supabaseUrl: "https://YOUR-PROJECT.supabase.co",
     supabaseAnonKey: "sb_publishable_...",
     adminEmail: "mrmadileng07@gmail.com"
   };
   ```

5. Host the site on an HTTPS static host and open that same hosted URL on the phone and laptop. Supabase automatically becomes the shared request store when the URL and key are set.
6. On the laptop, open **Admin**, choose the department, sign in with the Supabase admin email/password, and enter PIN `1504`. Department dashboards filter the shared requests by service.

Without the Supabase project and configured URL/key, a hosted website only saves requests in each browser; different devices will not share them. The PIN is a competition convenience gate. Supabase Auth and the row-level security rules protect cloud request data.

The browser publishable key is intended to be public and must be used with the SQL row-level security rules. Never put a Supabase secret or `service_role` key in `backend-config.js`. Keep the email in the SQL policies, Supabase Auth user, and `adminEmail` setting identical. Tracking by reference returns only service, location summary, status and time; phone, description, photo and GPS are not exposed by that lookup.
