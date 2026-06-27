import { MaintenanceRecord } from '../types';

/**
 * Exports the selected maintenance records list to a formatted CSV file.
 * Columns: Date, Subject, Details, Description, Who Did It, Costs
 */
export function exportRecordsToCSV(records: MaintenanceRecord[]): void {
  // Define CSV headers
  const headers = ['Date', 'Subject', 'Details', 'Description', 'Who Did It', 'Costs'];
  
  // Format row helper to escape values containing commas or double quotes
  const formatValue = (val: any): string => {
    if (val === undefined || val === null) return '';
    let stringVal = String(val);
    // Replace double quotes with escaped double quotes
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
      stringVal = `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  // Map records to CSV rows
  const rows = records.map(record => [
    record.date,
    record.subject,
    record.details,
    record.description || '',
    record.whoDidIt,
    record.cost
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(formatValue).join(','))
  ].join('\n');

  // Create downloadable blob
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create virtual link and trigger click
  const link = document.createElement('a');
  link.href = url;
  
  const currentDate = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Meridian_Heights_Maintenance_Export_${currentDate}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
