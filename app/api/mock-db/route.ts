import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "mock_db.json");

// Helper to get all data
function readDb() {
  if (!fs.existsSync(dbPath)) {
    const initialDb = {
      reviews: [
        {
          id: "r1",
          customer_name: "Alice Johnson",
          rating: 5,
          comment: "Amazing sticker application! Extremely clean lines and professional installation.",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "r2",
          customer_name: "Bob Miller",
          rating: 4,
          comment: "Great experience, sticker looks perfect on my laptop. Quick and friendly service.",
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "r3",
          customer_name: "Charlie Davis",
          rating: 5,
          comment: "Excellent custom design assistance. They helped me refine the logo and it looks great!",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      appointments: [],
      blocked_dates: [],
      blocked_time_slots: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }

  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading mock DB:", e);
    return { reviews: [], appointments: [], blocked_dates: [], blocked_time_slots: [] };
  }
}

// Helper to write all data
function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing mock DB:", e);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");

  const db = readDb();
  if (table) {
    return NextResponse.json(db[table] || []);
  }
  return NextResponse.json(db);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, table, data, column, value } = body;

    const db = readDb();
    if (!db[table]) {
      db[table] = [];
    }

    if (action === "insert") {
      const items = Array.isArray(data) ? data : [data];
      const newItems = items.map((item: any) => ({
        id: item.id || Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item,
      }));

      db[table].push(...newItems);
      writeDb(db);
      return NextResponse.json({ data: Array.isArray(data) ? newItems : newItems[0], error: null });
    }

    if (action === "delete") {
      db[table] = db[table].filter((item: any) => item[column] !== value);
      writeDb(db);
      return NextResponse.json({ data: null, error: null });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
