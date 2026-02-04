
import { supabase } from './src/supabaseClient.js';

async function verify() {
  console.log("Starting Supabase Verification...");

  try {
    // 1. Check Notices (NewsTicker uses this)
    console.log("Checking 'notices' table...");
    const { data: notices, error: noticesError } = await supabase.from('notices').select('*').limit(1);
    if (noticesError) {
      console.error("❌ Error fetching notices:", noticesError.message, noticesError.details, noticesError.hint);
    } else {
      console.log("✅ 'notices' table accessible. Count:", notices.length);
    }

    // 2. Check Classes
    console.log("Checking 'classes' table...");
    const { data: classes, error: classesError } = await supabase.from('classes').select('*').limit(1);
    if (classesError) {
      console.error("❌ Error fetching classes:", classesError.message);
    } else {
      console.log("✅ 'classes' table accessible.");
    }

  } catch (err) {
    console.error("❌ Unexpected script error:", err);
  }
}

verify();
