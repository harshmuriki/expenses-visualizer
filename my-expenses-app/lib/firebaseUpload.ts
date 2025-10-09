import { uploadTransactionsInBatch } from "@/components/sendDataFirebase";
import { Map, SankeyNode } from "@/app/types/types";

export interface UploadPayload {
  nodes: SankeyNode[];
  parentChildMap: Map;
  useremail: string;
  month: string;
}

export const uploadSankeyToFirestore = async ({
  nodes,
  parentChildMap,
  useremail,
  month,
}: UploadPayload): Promise<void> => {
  const batchData = [] as Array<{
    useremail: string;
    month: string;
    transaction: string | null;
    index: number | null;
    cost: number | null;
    isleaf: boolean | null;
    isMap: boolean;
    key: string | null;
    values: number[] | null;
    visible: boolean;
  }>;

  for (const node of nodes) {
    const isLeaf =
      node.index === 0 ? false : !Object.prototype.hasOwnProperty.call(parentChildMap, node.index);

    batchData.push({
      useremail,
      month,
      transaction: node.name,
      index: node.index,
      cost: node.cost ?? 0,
      isleaf: isLeaf,
      isMap: false,
      key: null,
      values: null,
      visible: node.visible ?? true,
    });
  }

  for (const [key, values] of Object.entries(parentChildMap)) {
    batchData.push({
      useremail,
      month,
      transaction: null,
      index: null,
      cost: null,
      isleaf: null,
      isMap: true,
      key,
      values: values as number[],
      visible: true,
    });
  }

  await uploadTransactionsInBatch(batchData);
};
