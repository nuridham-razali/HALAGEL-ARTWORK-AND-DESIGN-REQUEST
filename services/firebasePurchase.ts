import { PurchaseLog } from '../type';

const LOCAL_STORAGE_KEY = 'halagel_purchase_requests';

export const savePurchaseLog = async (log: PurchaseLog): Promise<void> => {
  try {
    const existingLogs = await getPurchaseLogs();
    const index = existingLogs.findIndex(l => l.id === log.id);
    
    if (index >= 0) {
      existingLogs[index] = log;
    } else {
      existingLogs.push(log);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingLogs));
  } catch (error) {
    console.error("Error saving purchase log to local storage: ", error);
  }
};

export const getPurchaseLogs = async (): Promise<PurchaseLog[]> => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return [];
    
    const logs: PurchaseLog[] = JSON.parse(data);
    // Sort descending by ID
    return logs.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (error) {
    console.error("Error getting purchase logs from local storage: ", error);
    return [];
  }
};
