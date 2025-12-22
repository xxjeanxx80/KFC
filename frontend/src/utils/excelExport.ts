import * as XLSX from 'xlsx';

export const exportToExcel = <T extends Record<string, unknown>>(data: T[], filename: string, sheetName: string = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data as Record<string, unknown>[]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const formatDateForExcel = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN');
};

export const formatCurrencyForExcel = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};
