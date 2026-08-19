import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * POST rather than GET on purpose: a GET sign-out can be triggered by any
 * <img> or prefetch pointing at it, which would log you out at random.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
