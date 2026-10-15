// The competition demo can use run-server.bat on the laptop's port 8000.
// Add a Supabase project URL/key to share requests across the public internet.
// Supabase settings automatically take priority over the local demo server.
// These browser values are public by design; protect request data with the RLS
// policies in supabase-setup.sql. Never put a service_role key in this file.
window.ROADRESCUE_CONFIG = {
  localServerMode: true,
  supabaseUrl: "",
  supabaseAnonKey: "",
  adminEmail: "mrmadileng07@gmail.com"
};
