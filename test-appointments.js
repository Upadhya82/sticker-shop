// Quick test script to check if appointments are in the database
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read .env.local file manually
const envPath = path.join(__dirname, ".env.local");
let supabaseUrl = "";
let supabaseAnonKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="?([^"]+)"?/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="?([^"]+)"?/);
  
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseAnonKey = keyMatch[1].trim();
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase env variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAppointments() {
  console.log("🔍 Testing appointment data retrieval...\n");

  try {
    // Check if table exists and has data
    const { data, error, status } = await supabase
      .from("appointments")
      .select("*", { count: "exact" });

    if (error) {
      console.error("❌ Error fetching appointments:");
      console.error(`   Status: ${error.code}`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Details: ${error.details}`);
      return;
    }

    console.log(`✅ Successfully connected to Supabase`);
    console.log(`📊 Total appointments found: ${data.length}\n`);

    if (data.length > 0) {
      console.log("📝 Sample appointments:");
      data.slice(0, 3).forEach((apt, i) => {
        console.log(`\n   [${i + 1}] ${apt.customer_name} | ${apt.service_type}`);
        console.log(`       Date: ${apt.appointment_date} at ${apt.time_slot}`);
        console.log(`       Phone: ${apt.phone}`);
      });
    } else {
      console.log("⚠️  No appointments found in database");
      console.log("   → Create an appointment first through the booking form");
    }

    // Also check the schema
    console.log("\n🔍 Checking table schema...");
    const { data: schema } = await supabase
      .from("appointments")
      .select()
      .limit(0);

    console.log("✅ Table exists and is accessible");

  } catch (error) {
    console.error("❌ Fatal error:", error.message);
  }
}

testAppointments();
