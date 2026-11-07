import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Server-side persistent storage file (fallback for standalone server)
const DB_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'users_db.json');

function ensureDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }), 'utf-8');
    }
  } catch (e) {
    console.warn('Filesystem access warning:', e);
  }
}

function readDb(): Record<string, any> {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: {} };
  }
}

function writeDb(data: any) {
  ensureDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Filesystem write warning:', e);
  }
}

// In-memory cache in case of serverless / read-only filesystem
const memoryStore: Record<string, any> = {};

// GET: Kullanıcı verisini getir
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ error: 'Kullanıcı adı gerekli' }, { status: 400 });
  }

  // Önce memory'e bak, yoksa dosyaya bak
  if (memoryStore[username]) {
    return NextResponse.json({ success: true, data: memoryStore[username] });
  }

  const db = readDb();
  const userData = db.users?.[username] || null;

  if (userData) {
    memoryStore[username] = userData;
  }

  return NextResponse.json({ success: true, data: userData });
}

// POST: Kullanıcı verisini kaydet / senkronize et
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, data, action } = body;

    const userKey = username?.trim().toLowerCase();
    if (!userKey) {
      return NextResponse.json({ error: 'Kullanıcı adı gerekli' }, { status: 400 });
    }

    // Tüm verileri silme eylemi
    if (action === 'clear') {
      delete memoryStore[userKey];
      const db = readDb();
      if (db.users) {
        delete db.users[userKey];
        writeDb(db);
      }
      return NextResponse.json({ success: true, message: 'Tüm veriler temizlendi' });
    }

    // Veriyi kaydet
    memoryStore[userKey] = data;
    const db = readDb();
    if (!db.users) db.users = {};
    db.users[userKey] = data;
    writeDb(db);

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Kaydetme hatası' }, { status: 500 });
  }
}
