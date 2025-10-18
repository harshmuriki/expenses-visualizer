import { AggregatorTransaction, Map, SankeyNode } from "@/app/types/types";
import { syncTransactions, PlaidTransaction } from "@/lib/plaidClient";
import {
  findUserByItemId,
  getItemRecord,
  persistAccessToken,
  updateItemCursor,
} from "@/lib/secureStore";
import { uploadSankeyToFirestore } from "@/lib/firebaseUpload";
import { Document } from "@/components/process";

export interface SyncJobRequest {
  userId: string;
  itemId: string;
  month?: string;
}

export interface SyncJobResult {
  success: boolean;
  itemId: string;
  month?: string;
  syncedTransactions: number;
  message?: string;
}

const mapPlaidTransaction = (
  transaction: PlaidTransaction
): AggregatorTransaction => {
  return {
    transaction_id:
      transaction.transaction_id ??
      `${transaction.account_id}-${transaction.date}`,
    account_id: transaction.account_id ?? "unknown",
    name: transaction.name ?? transaction.merchant_name ?? "Transaction",
    amount: transaction.amount,
    iso_currency_code:
      transaction.iso_currency_code ?? transaction.unofficial_currency_code,
    date: transaction.date ?? new Date().toISOString().slice(0, 10),
    pending: Boolean(transaction.pending),
    category: Array.isArray(transaction.category)
      ? transaction.category
      : undefined,
    merchant_name: transaction.merchant_name ?? null,
  };
};

const deriveMonthFromTransactions = (
  transactions: AggregatorTransaction[]
): string => {
  const first = transactions[0];
  if (!first?.date) {
    return new Date().toISOString().slice(0, 7);
  }
  const date = new Date(first.date);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 7);
  }
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

export const syncTransactionsForItem = async ({
  userId,
  itemId,
  month,
}: SyncJobRequest): Promise<SyncJobResult> => {
  const itemRecord = await getItemRecord(userId, itemId);
  if (!itemRecord) {
    return {
      success: false,
      itemId,
      month,
      syncedTransactions: 0,
      message: "No stored access token for item",
    };
  }

  const transactions: AggregatorTransaction[] = [];
  let cursor = itemRecord.cursor ?? null;
  let hasMore = true;

  while (hasMore) {
    const plaidResponse = await syncTransactions({
      accessToken: itemRecord.accessToken,
      cursor,
    });

    const added = Array.isArray(plaidResponse.added) ? plaidResponse.added : [];
    transactions.push(...added.map(mapPlaidTransaction));

    cursor = plaidResponse.next_cursor ?? cursor;
    hasMore = Boolean(plaidResponse.has_more);

    if (!hasMore) {
      break;
    }
  }

  await updateItemCursor(userId, itemId, cursor);

  const filteredTransactions = transactions.filter((txn) =>
    Number.isFinite(txn.amount)
  );

  if (filteredTransactions.length === 0) {
    return {
      success: true,
      itemId,
      month,
      syncedTransactions: 0,
      message: "No new transactions returned by aggregator",
    };
  }

  const document = Document.fromCategorizedTransactions(filteredTransactions);
  const { output, parentChildMap } = document.convertData();
  const typedParentChildMap: Map = Object.entries(parentChildMap).reduce(
    (acc, [key, value]) => {
      acc[Number(key)] = value as number[];
      return acc;
    },
    {} as Map
  );
  const sankeyNodes: SankeyNode[] = output.nodes.map((node) => ({
    name: node.name,
    index: node.index,
    cost: node.cost,
    visible: true,
    date: node.date,
    location: node.location,
    bank: node.bank,
    raw_str: node.raw_str,
  }));

  const targetMonth =
    month ?? deriveMonthFromTransactions(filteredTransactions);

  await uploadSankeyToFirestore({
    nodes: sankeyNodes,
    parentChildMap: typedParentChildMap,
    useremail: userId,
    month: targetMonth,
  });

  return {
    success: true,
    itemId,
    month: targetMonth,
    syncedTransactions: filteredTransactions.length,
  };
};

export const triggerSyncForItemId = async (
  itemId: string
): Promise<SyncJobResult | undefined> => {
  const binding = await findUserByItemId(itemId);
  if (!binding) {
    return undefined;
  }

  return syncTransactionsForItem({
    userId: binding.userId,
    itemId: binding.item.itemId,
  });
};

export const storeAccessToken = async (
  userId: string,
  itemId: string,
  accessToken: string,
  institution?: string | null
): Promise<void> => {
  await persistAccessToken(userId, itemId, accessToken, institution);
};
