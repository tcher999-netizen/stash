import localForage from "localforage";

const QUEUE_KEY = "persistent-scene-queue";
const QUEUE_POSITION_KEY = "persistent-queue-position";

export interface IPersistentQueue {
  sceneIDs: string[];
  currentIndex: number;
  lastUpdated: number;
}

class PersistentQueueManager {
  private static instance: PersistentQueueManager;
  private listeners: ((queueIDs: string[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): PersistentQueueManager {
    if (!PersistentQueueManager.instance) {
      PersistentQueueManager.instance = new PersistentQueueManager();
    }
    return PersistentQueueManager.instance;
  }

  public async getQueueIDs(): Promise<string[]> {
    try {
      const data = await localForage.getItem<IPersistentQueue>(QUEUE_KEY);
      return data?.sceneIDs || [];
    } catch (error) {
      console.error("Error loading queue from storage:", error);
      return [];
    }
  }

  public async saveQueueIDs(sceneIDs: string[]): Promise<void> {
    try {
      const data: IPersistentQueue = {
        sceneIDs,
        currentIndex: 0,
        lastUpdated: Date.now(),
      };
      await localForage.setItem(QUEUE_KEY, data);
      this.notifyListeners(sceneIDs);
    } catch (error) {
      console.error("Error saving queue to storage:", error);
    }
  }

  public async addToQueue(sceneId: string): Promise<void> {
    const queue = await this.getQueueIDs();
    const existingIndex = queue.findIndex((id) => id === sceneId);

    if (existingIndex === -1) {
      queue.push(sceneId);
      await this.saveQueueIDs(queue);
    }
  }

  public async removeFromQueue(sceneId: string): Promise<void> {
    const queue = await this.getQueueIDs();
    const filtered = queue.filter((id) => id !== sceneId);
    await this.saveQueueIDs(filtered);
  }

  public async clearQueue(): Promise<void> {
    try {
      await localForage.removeItem(QUEUE_KEY);
      await localForage.removeItem(QUEUE_POSITION_KEY);
      this.notifyListeners([]);
    } catch (error) {
      console.error("Error clearing queue:", error);
    }
  }

  public async reorderQueue(
    fromIndex: number,
    toIndex: number
  ): Promise<void> {
    const queue = await this.getQueueIDs();
    if (fromIndex < 0 || fromIndex >= queue.length) return;
    if (toIndex < 0 || toIndex >= queue.length) return;

    const [removed] = queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, removed);
    await this.saveQueueIDs(queue);
  }

  public async getCurrentPosition(): Promise<number> {
    try {
      const position = await localForage.getItem<number>(QUEUE_POSITION_KEY);
      return position || 0;
    } catch (error) {
      console.error("Error loading queue position:", error);
      return 0;
    }
  }

  public async saveCurrentPosition(index: number): Promise<void> {
    try {
      await localForage.setItem(QUEUE_POSITION_KEY, index);
    } catch (error) {
      console.error("Error saving queue position:", error);
    }
  }

  public async markAsWatched(sceneId: string): Promise<void> {
    await this.removeFromQueue(sceneId);
  }

  public subscribe(listener: (queueIDs: string[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(queueIDs: string[]): void {
    this.listeners.forEach((listener) => listener(queueIDs));
  }
}

export const persistentQueue = PersistentQueueManager.getInstance();
