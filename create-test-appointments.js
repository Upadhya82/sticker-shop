// Script to create test appointments for testing the admin dashboard
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read .env.local file
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

async function createTestAppointments() {
  console.log("➕ Creating test appointments...\n");

  const today = new Date();
  const testAppointments = [];

  // Create 5 test appointments
  for (let i = 0; i < 5; i++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(appointmentDate.getDate() + i);
    const dateStr = appointmentDate.toISOString().split("T")[0];

    testAppointments.push({
      customer_name: `Test Customer ${i + 1}`,
      phone: `555-${String(1000 + i).padStart(4, "0")}`,
      service_type: ["Sticker Design", "Custom Print", "Rush Order"][i % 3],
      appointment_date: dateStr,
      time_slot: ["09:00", "10:30", "13:00", "14:30", "16:00"][i],
    });
  }

  try {
    const { data, error } = await supabase
      .from("appointments")
      .insert(testAppointments)
      .select();

    if (error) {
      console.error("❌ Error creating appointments:");
      console.error(`   ${error.message}`);
      return;
    }

    console.log(`✅ Successfully created ${data.length} test appointments!\n`);
    data.forEach((apt, i) => {
      console.log(`   [${i + 1}] ${apt.customer_name}`);
      console.log(`       📅 ${apt.appointment_date} @ ${apt.time_slot}`);
      console.log(`       📱 ${apt.phone}`);
      console.log(`       🎨 ${apt.service_type}\n`);
    });

    console.log("✨ Now check your admin dashboard at /admin");
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
  }
}

createTestAppointments();
