const SHEET_NAME = 'Plots'; // Make sure your sheet tab is named 'Plots'

// Handle GET requests: Return all plot data
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
       return createJsonResponse({ status: 'error', message: `Sheet '${SHEET_NAME}' not found` });
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const jsonArray = rows.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    return createJsonResponse({
      status: 'success',
      data: jsonArray
    });
    
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.message });
  }
}

// Handle POST requests: Update plot status
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
       return createJsonResponse({ status: 'error', message: `Sheet '${SHEET_NAME}' not found` });
    }
    
    // Parse the JSON request body
    let requestData;
    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    } else {
      return createJsonResponse({ status: 'error', message: 'No payload provided' });
    }
    
    const plotId = requestData.id;
    const newStatus = requestData.status;
    
    if (!plotId || !newStatus) {
      return createJsonResponse({ status: 'error', message: 'Missing id or status in payload' });
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const idIndex = headers.indexOf('id');
    const statusIndex = headers.indexOf('status');
    
    if (idIndex === -1 || statusIndex === -1) {
      return createJsonResponse({ status: 'error', message: 'Missing id or status columns in sheet' });
    }
    
    let rowIndexToUpdate = -1;
    // Find the row with the matching plot ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] === plotId) {
        rowIndexToUpdate = i + 1; // Apps Script rows are 1-indexed, and we skip header
        break;
      }
    }
    
    if (rowIndexToUpdate !== -1) {
      // Update the status cell
      sheet.getRange(rowIndexToUpdate, statusIndex + 1).setValue(newStatus);
      return createJsonResponse({ status: 'success', message: 'Status updated successfully' });
    } else {
      return createJsonResponse({ status: 'error', message: 'Plot ID not found' });
    }
    
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// Helper to handle OPTIONS preflight requests for CORS
function doOptions(e) {
  return createJsonResponse({ status: 'success', message: 'CORS preflight successful' });
}

// Helper to create JSON response with CORS headers
function createJsonResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}

// --------------------------------------------------------------------------------
// UTILITY SCRIPT (Run this ONCE to set up your sheet headers)
// --------------------------------------------------------------------------------
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  const headers = ['id', 'type', 'size', 'sqyd', 'rate', 'status', 'buyer', 'date', 'advance'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  
  // Freeze the top row
  sheet.setFrozenRows(1);
  
  Logger.log(`Sheet '${SHEET_NAME}' has been set up with headers.`);
}
