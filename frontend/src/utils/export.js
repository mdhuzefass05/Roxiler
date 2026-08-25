/**
 * export.js — Client-side CSV export utilities.
 * Generates and triggers browser downloads for tabular data in clean CSV format.
 */

/**
 * Escape and format a value for CSV output
 */
const formatCsvValue = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Download a CSV file in the browser
 * @param {string} filename
 * @param {Array<string>} headers
 * @param {Array<Array<any>>} rows
 */
export const downloadCsv = (filename, headers, rows) => {
  const headerLine = headers.map(formatCsvValue).join(',');
  const rowLines = rows.map((r) => r.map(formatCsvValue).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export Users list to CSV
 */
export const exportUsersCsv = (users, filename = 'store_rating_users.csv') => {
  const headers = ['ID', 'Full Name', 'Email Address', 'Role', 'Address', 'Registered Date'];
  const rows = users.map((u) => [
    u.id,
    u.name,
    u.email,
    u.role,
    u.address,
    new Date(u.created_at).toLocaleString(),
  ]);
  downloadCsv(filename, headers, rows);
};

/**
 * Export Stores list to CSV
 */
export const exportStoresCsv = (stores, filename = 'store_rating_stores.csv') => {
  const headers = ['ID', 'Store Name', 'Category', 'Store Email', 'Address', 'Owner ID', 'Average Rating', 'Total Reviews'];
  const rows = stores.map((s) => [
    s.id,
    s.name,
    s.category || 'General',
    s.email,
    s.address,
    s.owner_id || 'Unassigned',
    s.average_rating ? s.average_rating.toFixed(2) : '0.00',
    s.total_ratings || 0,
  ]);
  downloadCsv(filename, headers, rows);
};

/**
 * Export Customer Reviews list to CSV
 */
export const exportReviewsCsv = (ratings, storeName = 'Store', filename = 'customer_reviews.csv') => {
  const headers = ['Review ID', 'Store Name', 'Customer Name', 'Customer Email', 'Score (1-5)', 'Comment', 'Date'];
  const rows = ratings.map((r) => [
    r.id,
    storeName,
    r.user?.name || r.user_name || 'Customer',
    r.user?.email || r.user_email || '',
    r.rating_value,
    r.comment || '',
    new Date(r.created_at).toLocaleString(),
  ]);
  downloadCsv(filename, headers, rows);
};
