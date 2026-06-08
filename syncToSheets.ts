import { PurchaseLog } from './type';

const SCRIPT_URL_KEY = 'halagel_app_script_url';

export const syncLogsToSheets = async (logs: PurchaseLog[]) => {
  let scriptUrl = localStorage.getItem(SCRIPT_URL_KEY);

  if (!scriptUrl) {
    scriptUrl = window.prompt("Please enter your Google Apps Script Web App URL:");
    if (!scriptUrl) {
      throw new Error('Sync cancelled. Apps Script URL is required.');
    }
    localStorage.setItem(SCRIPT_URL_KEY, scriptUrl);
  }

  // Define headers and format rows
  const headers = ['PR No', 'Status', 'Date Created', 'Time Created', 'Requester Name', 'Company Name', 'Department', 'Recommended Supplier', 'Total Cost', 'Purpose'];
  
  const values = [
    headers,
    ...logs.map(log => {
      const data = log.data;
      const totalCost = data?.items?.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.costPerUnit || 0)), 0) || 0;
      
      return [
        log.prNo,
        log.status || '',
        log.dateCreated,
        log.createdAtTime,
        log.requesterName || '',
        log.companyName || '',
        log.department || '',
        data?.recommendedSupplier || '',
        totalCost.toString(),
        data?.purpose || '',
      ];
    })
  ];

  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      // Send as text/plain to avoid CORS preflight, Apps Script can still parse it with JSON.parse
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ values }),
    });

    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    
    return result.sheetUrl; // Return the sheet URL from App Script
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      // Sometimes cors errors manifest as Failed to fetch, but we used text/plain so it shouldn't unless the url is bad
      localStorage.removeItem(SCRIPT_URL_KEY); // clear bad url
      throw new Error(`Failed to connect to the Apps Script URL. Please check the URL or your network connection. Try syncing again to re-enter. (${err.message})`);
    }
    throw err;
  }
};

