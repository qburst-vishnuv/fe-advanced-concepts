/* eslint-disable no-restricted-globals */

export enum WorkerActions {
  INIT = 'INIT',
  INIT_COMPLETE = 'INIT_COMPLETE',
  UPDATE_STREAM = 'UPDATE_STREAM',
  UPDATE_COMPLETE = 'UPDATE_COMPLETE',
  FILTER = 'FILTER',
  FILTER_COMPLETE = 'FILTER_COMPLETE',
}

export interface SupplierInfoType {
  name: string;
  location: string;
  rating: number;
}



export interface ProductType {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  lastUpdated: number;
  supplierInfo?: SupplierInfoType;
}

// Lightweight entity transferred to Main Thread (no supplier metadata)
export type OptimizedProduct = Omit<ProductType, 'supplierInfo'>;

export interface StockUpdate {
  id: string;
  stockDelta: number;
}

export type WorkerIncomingMessage =
  | { type: WorkerActions.INIT; payload: { products: ProductType[] } }
  | { type: WorkerActions.UPDATE_STREAM; payload: { updates: StockUpdate[] } }
  | { type: WorkerActions.FILTER; payload: { category?: string; query?: string } };

export type WorkerOutgoingMessage =
  | { type: WorkerActions.INIT_COMPLETE; data: OptimizedProduct[] }
  | { type: WorkerActions.UPDATE_COMPLETE; data: OptimizedProduct[] }
  | { type: WorkerActions.FILTER_COMPLETE; data: OptimizedProduct[] };

class InventoryRepository {
  // O(1) primary lookup by ID
  private items = new Map<string, OptimizedProduct>();
  // Detached metadata store retained exclusively inside worker memory
  private metadata = new Map<string, Readonly<SupplierInfoType>>();
  // O(1) index by category
  private categoryIndices = new Map<string, Set<string>>();
  // Active filtered IDs cache (to prevent stream updates from blowing away user filters)
  private currentFilterSet: Set<string> | null = null;

  public clear(): void {
    this.items.clear();
    this.metadata.clear();
    this.categoryIndices.clear();
    this.currentFilterSet = null;
  }

  public init(products: ProductType[]): OptimizedProduct[] {
    this.clear();
    const result: OptimizedProduct[] = new Array(products.length);

    for (let i = 0; i < products.length; i++) {
      const { supplierInfo, ...cleanProduct } = products[i];
      const id = cleanProduct.id;

      this.items.set(id, cleanProduct);

      if (supplierInfo) {
        this.metadata.set(id, Object.freeze(supplierInfo));
      }

      if (!this.categoryIndices.has(cleanProduct.category)) {
        this.categoryIndices.set(cleanProduct.category, new Set());
      }
      this.categoryIndices.get(cleanProduct.category)!.add(id);

      result[i] = cleanProduct;
    }

    return result;
  }

  public updateBatch(updates: StockUpdate[]): OptimizedProduct[] {
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const item = this.items.get(update.id);
      
      // O(1) mutation
      if (item) {
        item.stock = Math.max(0, item.stock + update.stockDelta);
        item.lastUpdated = Date.now();
      }
    }

    // Return only active filtered items if a filter is currently applied
    if (this.currentFilterSet) {
      const activeList: OptimizedProduct[] = [];
      this.currentFilterSet.forEach((id) => {
        const item = this.items.get(id);
        if (item) activeList.push(item);
      });
      return activeList;
    }

    return Array.from(this.items.values());
  }

  public filter(category?: string, query?: string): OptimizedProduct[] {
    const hasCategory = category && category !== 'ALL';
    const lowerQuery = query?.trim().toLowerCase();

    // Fast path: No filters applied
    if (!hasCategory && !lowerQuery) {
      this.currentFilterSet = null;
      return Array.from(this.items.values());
    }

    const matched: OptimizedProduct[] = [];
    const matchedIds = new Set<string>();

    if (hasCategory) {
      const candidateIds = this.categoryIndices.get(category);
      if (candidateIds) {
        candidateIds.forEach((id) => {
          const item = this.items.get(id);
          if (item && (!lowerQuery || item.name.toLowerCase().includes(lowerQuery))) {
            matched.push(item);
            matchedIds.add(id);
          }
        });
      }
    } else {
      for (const item of this.items.values()) {
        if (!lowerQuery || item.name.toLowerCase().includes(lowerQuery)) {
          matched.push(item);
          matchedIds.add(item.id);
        }
      }
    }

    this.currentFilterSet = matchedIds;
    return matched;
  }
}

const repository = new InventoryRepository();

self.onmessage = function (e: MessageEvent<WorkerIncomingMessage>): void {
  const { type, payload } = e.data;

  switch (type) {
    case WorkerActions.INIT: {
      const optimizedData = repository.init(payload.products);
      const message: WorkerOutgoingMessage = {
        type: WorkerActions.INIT_COMPLETE,
        data: optimizedData,
      };
      self.postMessage(message);
      break;
    }

    case WorkerActions.UPDATE_STREAM: {
      const updatedData = repository.updateBatch(payload.updates);
      const message: WorkerOutgoingMessage = {
        type: WorkerActions.UPDATE_COMPLETE,
        data: updatedData,
      };
      self.postMessage(message);
      break;
    }

    case WorkerActions.FILTER: {
      const filteredData = repository.filter(payload.category, payload.query);
      const message: WorkerOutgoingMessage = {
        type: WorkerActions.FILTER_COMPLETE,
        data: filteredData,
      };
      self.postMessage(message);
      break;
    }

    default:
      break;
  }
};

export default self;
