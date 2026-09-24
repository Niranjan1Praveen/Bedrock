-- ContactMessage was created without row level security, unlike every other
-- table. Anything that can reach Supabase's REST API with the publishable key
-- could then read or write it, and it holds visitors' email addresses.
--
-- With RLS on and no policies, that key sees nothing. The app is unaffected: it
-- connects as a role that bypasses RLS, exactly as it does for the other tables.
ALTER TABLE "ContactMessage" ENABLE ROW LEVEL SECURITY;
