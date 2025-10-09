import { promises as fs } from "fs";
import path from "path";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

type ItemRecord = {
  itemId: string;
  accessToken: string;
  institution?: string | null;
  cursor?: string | null;
  createdAt: string;
  updatedAt: string;
};

type SecureStoreShape = {
  [userId: string]: {
    items: ItemRecord[];
  };
};

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "secure-store.json.enc");

const getKey = (): Buffer => {
  const rawKey = process.env.TOKEN_STORE_KEY;
  if (!rawKey) {
    throw new Error("TOKEN_STORE_KEY environment variable is required for encrypting access tokens.");
  }

  const buffer = rawKey.length === 44 ? Buffer.from(rawKey, "base64") : Buffer.from(rawKey);
  if (buffer.length < 32) {
    return Buffer.concat([buffer, Buffer.alloc(32 - buffer.length)]).subarray(0, 32);
  }

  return buffer.subarray(0, 32);
};

const ensureStoreDir = async () => {
  await fs.mkdir(STORE_DIR, { recursive: true });
};

const encryptPayload = (payload: SecureStoreShape): string => {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
};

const decryptPayload = (ciphertext: string): SecureStoreShape => {
  const key = getKey();
  const buffer = Buffer.from(ciphertext, "base64");
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  return JSON.parse(decrypted) as SecureStoreShape;
};

const readStore = async (): Promise<SecureStoreShape> => {
  try {
    const payload = await fs.readFile(STORE_PATH, "utf8");
    return decryptPayload(payload);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
};

const writeStore = async (data: SecureStoreShape): Promise<void> => {
  await ensureStoreDir();
  const payload = encryptPayload(data);
  await fs.writeFile(STORE_PATH, payload, { encoding: "utf8", mode: 0o600 });
};

const upsertItem = (items: ItemRecord[], item: ItemRecord): ItemRecord[] => {
  const index = items.findIndex((record) => record.itemId === item.itemId);
  if (index >= 0) {
    const existing = items[index];
    const updated = {
      ...existing,
      ...item,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
  } else {
    const timestamp = new Date().toISOString();
    items.push({
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
  return items;
};

export const persistAccessToken = async (
  userId: string,
  itemId: string,
  accessToken: string,
  institution?: string | null
): Promise<void> => {
  const store = await readStore();
  const userEntry = store[userId] ?? { items: [] };
  userEntry.items = upsertItem(userEntry.items, {
    itemId,
    accessToken,
    institution: institution ?? null,
    cursor: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  store[userId] = userEntry;
  await writeStore(store);
};

export const getItemRecord = async (
  userId: string,
  itemId: string
): Promise<ItemRecord | undefined> => {
  const store = await readStore();
  return store[userId]?.items.find((item) => item.itemId === itemId);
};

export const updateItemCursor = async (
  userId: string,
  itemId: string,
  cursor: string | null
): Promise<void> => {
  const store = await readStore();
  const userEntry = store[userId];
  if (!userEntry) {
    return;
  }
  const item = userEntry.items.find((record) => record.itemId === itemId);
  if (!item) {
    return;
  }
  item.cursor = cursor ?? null;
  item.updatedAt = new Date().toISOString();
  await writeStore(store);
};

export const findUserByItemId = async (
  itemId: string
): Promise<{ userId: string; item: ItemRecord } | undefined> => {
  const store = await readStore();
  for (const [userId, entry] of Object.entries(store)) {
    const item = entry.items.find((record) => record.itemId === itemId);
    if (item) {
      return { userId, item };
    }
  }
  return undefined;
};

export const listUserItems = async (userId: string): Promise<ItemRecord[]> => {
  const store = await readStore();
  return store[userId]?.items ?? [];
};

export type StoredItemRecord = ItemRecord;
