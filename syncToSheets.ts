import { getAccessToken, googleSignIn } from './googleAuth';
import { PurchaseLog } from './type';

const SHEET_ID_KEY = 'halagel_google_sheet_id';

export const syncLogsToSheets = async (logs: PurchaseLog[]) => {
  let token = await getAccessToken();
  if (!token) {
    const res = await googleSignIn();
    if (!res) throw new Error('Sign in failed');
    token = res.accessToken;
  }

  let sheetId = localStorage.getItem(SHEET_ID_KEY);

  if (!sheetId) {
    // Create new spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: 'Halagel Purchase Requests Database',
        },
      }),
    });
    if (!createRes.ok) throw new Error('Failed to create spreadsheet');
    const createData = await createRes.json();
    sheetId = createData.spreadsheetId;
    localStorage.setItem(SHEET_ID_KEY, sheetId!);
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

  // We rewrite the entire sheet to keep it in sync (for simplicity)
  // Clear existing
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:Z1000:clear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  // Update
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:J${values.length}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `Sheet1!A1:J${values.length}`,
      majorDimension: 'ROWS',
      values: values,
    }),
  });

  if (!updateRes.ok) {
    throw new Error('Failed to update spreadsheet');
  }

  return sheetId;
};
