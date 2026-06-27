/**
 * Helper to generate elegant mock receipts and invoices as base64 images,
 * allowing pre-seeded maintenance records to have visual proof files immediately.
 */

export function generateMockReceipt(title: string, amount: number, date: string, ref: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 400, 500);
  
  // Border dashed
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(10, 10, 380, 480);
  ctx.setLineDash([]);
  
  // Header banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(20, 20, 360, 80);
  
  // Logo Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Outfit", sans-serif';
  ctx.fillText('MERIDIEN HEIGHTS INT\'L SCHOOL', 40, 50);
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Official Maintenance Receipt & Proof', 40, 75);
  
  // Receipt Details Title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px "Outfit", sans-serif';
  ctx.fillText('TRANSACTION PROOF', 40, 140);
  
  // Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 150);
  ctx.lineTo(360, 150);
  ctx.stroke();
  
  // Key value pairs helper
  const drawRow = (label: string, value: string, y: number) => {
    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText(label, 40, y);
    
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(value, 360, y);
    ctx.textAlign = 'left';
  };
  
  drawRow('Receipt Ref:', ref, 180);
  drawRow('Date:', date, 210);
  drawRow('Category:', 'Facility Maintenance', 240);
  drawRow('Item/Subject:', title.length > 25 ? title.substring(0, 22) + '...' : title, 270);
  drawRow('Payment Status:', 'PAID (Received)', 300);
  
  // Another divider
  ctx.beginPath();
  ctx.moveTo(40, 320);
  ctx.lineTo(360, 320);
  ctx.stroke();
  
  // Total Amount
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px "Outfit", sans-serif';
  ctx.fillText('TOTAL AMOUNT', 40, 355);
  
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`₦${amount.toLocaleString()}`, 360, 355);
  ctx.textAlign = 'left';
  
  // Stamp / Signature
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.strokeRect(220, 390, 130, 45);
  
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px "Outfit", sans-serif';
  ctx.fillText('MHIS APPROVED', 230, 410);
  ctx.font = '9px "Inter", sans-serif';
  ctx.fillText('FACILITY MANAGER', 230, 425);
  
  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 10px "Inter", sans-serif';
  ctx.fillText('Thank you for keeping our environment safe and premium.', 40, 470);
  
  return canvas.toDataURL('image/png');
}
