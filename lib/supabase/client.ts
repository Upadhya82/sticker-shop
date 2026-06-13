import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Use real client if explicitly requested
const useRealSupabase = process.env.USE_REAL_SUPABASE === "true";

let fs: any;
let path: any;
if (typeof window === "undefined") {
  try {
    fs = require("fs");
    path = require("path");
  } catch (e) {
    // Node modules not available
  }
}

const isBrowser = typeof window !== "undefined";

function getMockDataSync(table: string): any[] {
  if (isBrowser) {
    const val = localStorage.getItem(`mock_${table}`);
    if (val) {
      try {
        return JSON.parse(val);
      } catch (e) {}
    }
    return [];
  } else {
    if (!fs || !path) return [];
    const dbPath = path.join(process.cwd(), "mock_db.json");
    if (!fs.existsSync(dbPath)) {
      const initialDb: Record<string, any[]> = {
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
      return initialDb[table] || [];
    }
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      return db[table] || [];
    } catch (e) {
      return [];
    }
  }
}

async function getMockData(table: string): Promise<any[]> {
  if (isBrowser) {
    try {
      const res = await fetch(`/api/mock-db?table=${table}`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`mock_${table}`, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn("Mock API fetch failed, falling back to localStorage", e);
    }
    return getMockDataSync(table);
  } else {
    return getMockDataSync(table);
  }
}

async function insertMockData(table: string, data: any): Promise<{ data: any; error: any }> {
  if (isBrowser) {
    try {
      const res = await fetch("/api/mock-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "insert", table, data })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      console.warn("Mock API insert failed, falling back to localStorage", e);
    }
    const current = getMockDataSync(table);
    const items = Array.isArray(data) ? data : [data];
    const newItems = items.map(item => ({
      id: item.id || Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item
    }));
    const updated = [...current, ...newItems];
    localStorage.setItem(`mock_${table}`, JSON.stringify(updated));
    return { data: Array.isArray(data) ? newItems : newItems[0], error: null };
  } else {
    if (!fs || !path) return { data: null, error: { message: "FS not loaded" } };
    const dbPath = path.join(process.cwd(), "mock_db.json");
    let db: Record<string, any[]> = { reviews: [], appointments: [], blocked_dates: [], blocked_time_slots: [] };
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      } catch (e) {}
    }
    const items = Array.isArray(data) ? data : [data];
    const newItems = items.map((item: any) => ({
      id: item.id || Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item
    }));
    db[table] = [...(db[table] || []), ...newItems];
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
    return { data: Array.isArray(data) ? newItems : newItems[0], error: null };
  }
}

async function deleteMockData(table: string, column: string, value: any): Promise<{ data: any; error: any }> {
  if (isBrowser) {
    try {
      const res = await fetch("/api/mock-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table, column, value })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      console.warn("Mock API delete failed, falling back to localStorage", e);
    }
    const current = getMockDataSync(table);
    const updated = current.filter(item => item[column] !== value);
    localStorage.setItem(`mock_${table}`, JSON.stringify(updated));
    return { data: null, error: null };
  } else {
    if (!fs || !path) return { data: null, error: { message: "FS not loaded" } };
    const dbPath = path.join(process.cwd(), "mock_db.json");
    if (fs.existsSync(dbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        db[table] = (db[table] || []).filter((item: any) => item[column] !== value);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
      } catch (e) {}
    }
    return { data: null, error: null };
  }
}

class MockQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderBy?: { column: string; ascending: boolean };
  private limitVal?: number;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(item => item[column] === value);
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push(item => item[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push(item => item[column] <= value);
    return this;
  }

  order(column: string, options?: { ascending: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(num: number) {
    this.limitVal = num;
    return this;
  }

  async insert(data: any) {
    return insertMockData(this.table, data);
  }

  delete() {
    return {
      eq: async (column: string, value: any) => {
        return deleteMockData(this.table, column, value);
      }
    };
  }

  private async execute() {
    let data = await getMockData(this.table);

    // Apply filters
    for (const filter of this.filters) {
      data = data.filter(filter);
    }

    // Apply order
    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      data.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitVal !== undefined) {
      data = data.slice(0, this.limitVal);
    }

    return data;
  }

  async then(onfulfilled?: (value: any) => any) {
    try {
      const data = await this.execute();
      const res = { data, error: null };
      return onfulfilled ? onfulfilled(res) : res;
    } catch (e: any) {
      const res = { data: null, error: { message: e.message } };
      return onfulfilled ? onfulfilled(res) : res;
    }
  }

  async single() {
    try {
      const data = await this.execute();
      if (data.length === 0) {
        return { data: null, error: { message: "No rows found" } };
      }
      return { data: data[0], error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  }

  async maybeSingle() {
    try {
      const data = await this.execute();
      return { data: data.length > 0 ? data[0] : null, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  }
}

// Create the export client
export const supabase = useRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      from: (table: string) => new MockQueryBuilder(table),
    } as any);