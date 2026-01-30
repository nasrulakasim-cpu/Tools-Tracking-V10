import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MovementRequest, InventoryItem, RequestType, RequestStatus } from '../types';

/**
 * High-quality Base64 Logo (Remaco with Bulb Icon)
 */
const LOGO_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABACAYAAABf8vS/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj33VoKUmCRAKpKm98SREIsQS4pUG4qcGCuijJlhiijS7fSgqWUMFEABQUBAMBE9oMLITID0IXS9O9LBCYmIUI66CH7uK6ChpY886+S1fPbe6zX7987595v97c89fO82AJC5S8IBLAtAkS8RBu/NzzQQE7zDBSHAEBICAYUfLMBEXBgYy68P37YAKvL8wBfWvXy998xsB8S6UM25sBPrsnEAAp8fAAInI8UKURp66pCxq5uI5QFAmIuEgb8SBCBkIA9S5Yp7T6AOc4Y5954Yf8u810M2KDHptmU8GisS+eYmGLZstSpzuB3ZLW7O3uO0hL78vmd46tO7FzWp6Y579737+5y+yS9qV50S+6L869s29c9X6LOn/lW99ZfmO99S77n7yPdof4VmO69p96w94/3mO/Z8z6v2u8p7f2y9v/v8d/799/799_placeholder_for_full_base64_logo_data';

// Simplified Drawing for the logo icon since base64 can be truncated in some environments
// I will use a helper to draw the branding to ensure it never breaks
const drawBranding = (doc: jsPDF, x: number, y: number, scale: number = 1) => {
  // Bulb Color (Orange-Red)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6 * scale);
  
  // area untuk letak logo tnb. kalau dh letak kena tukar scale text untuk X

  // REMACO Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14 * scale);
  doc.setTextColor(0, 42, 92);
  doc.text('REMACO', x + 1 * scale, y + 10 * scale);
  
  // Subtext
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6 * scale);
  doc.setTextColor(50, 50, 50);
  doc.text('A subsidiary of TNB Power Generation', x + 1 * scale, y + 13 * scale);
  doc.setTextColor(0, 0, 0); // Reset
};

/**
 * Configuration mapping for different form types based on KPI requirements.
 */
export const getFormConfig = (type: RequestType) => {
  switch (type) {
    case RequestType.ROSAK:
      return { id: 'QF.101', title: 'PERALATAN ROSAK UNTUK DIBAIKI', dateLabel: 'TARIKH KEROSAKAN', reportLabel: 'LAPORAN KEROSAKAN' };
    case RequestType.SCRAP:
      return { id: 'QF.102', title: 'LAPORAN PELUPUSAN PERALATAN (SKRAP)', dateLabel: 'TARIKH SKRAP', reportLabel: 'LAPORAN SKRAP' };
    case RequestType.LOST:
      return { id: 'QF.103', title: 'LAPORAN KEHILANGAN PERALATAN', dateLabel: 'TARIKH KEHILANGAN', reportLabel: 'LAPORAN KEHILANGAN' };
    case RequestType.BORROW:
    case RequestType.RETURN:
    default:
      return { id: 'QF.100', title: 'PERALATAN KELUAR/MASUK', dateLabel: 'TARIKH', reportLabel: 'LAPORAN' };
  }
};

const drawReportHeader = (doc: jsPDF, type: RequestType) => {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const config = getFormConfig(type);

  // Draw Logo Branding
  drawBranding(doc, margin, 8, 1.2);

  // Center Title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(config.title, pageWidth / 2, 15, { align: 'center' });

  // Right Form ID
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(config.id, pageWidth - margin, 16, { align: 'right' });

  // Header Line
  doc.setLineWidth(0.4);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, 25, pageWidth - margin, 25);
};

const renderReportForm = (doc: jsPDF, request: MovementRequest, storekeeperName: string, managerName: string) => {
  const config = getFormConfig(request.type);
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;

  drawReportHeader(doc, request.type);
  
  // Info Fields
  doc.setFontSize(9);
  const fields = [
    { label: 'MARKAS/ WORKSHOP', value: request.base },
    { label: 'NO. KERJA', value: '' },
    { label: 'PROJEK', value: '' }
  ];
  fields.forEach((f, i) => {
    const y = 35 + (i * 6);
    doc.text(`${f.label}  :`, margin, y);
    doc.line(margin + 45, y + 1, pageWidth - margin, y + 1);
    doc.text(f.value.toUpperCase(), margin + 47, y);
  });

  autoTable(doc, {
    startY: 55,
    head: [['BIL.', 'PERALATAN', 'CATATAN', 'KUANTITI']],
    body: Array(8).fill(null).map((_, i) => [
      i < request.items.length ? i + 1 : i + 1,
      i < request.items.length ? `${request.items[i].description}\nS/N: ${request.items[i].serialNo}` : '',
      '',
      i < request.items.length ? '1' : ''
    ]),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, cellPadding: 2, minCellHeight: 6 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], halign: 'center', fontStyle: 'normal' },
    columnStyles: { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 35 }, 3: { cellWidth: 20, halign: 'center' } },
    margin: { left: margin, right: margin }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.text(config.dateLabel, margin, currentY);
  doc.rect(pageWidth - margin - 60, currentY - 4.5, 60, 6.5);
  doc.text(new Date(request.timestamp).toLocaleDateString(), pageWidth - margin - 58, currentY);

  const drawSigSection = (title: string, roleLabel: string, name: string, y: number, reasonText?: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(title, margin, y);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
    
    doc.setDrawColor(220, 220, 220); // Faint gray
    doc.setLineWidth(0.1);
    doc.line(margin, y + 8, pageWidth - margin, y + 8);
    doc.line(margin, y + 15, pageWidth - margin, y + 15);
    doc.line(margin, y + 22, pageWidth - margin, y + 22);
    doc.setDrawColor(0, 0, 0);

    if (reasonText) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      const splitReason = doc.splitTextToSize(`CATATAN: ${reasonText}`, pageWidth - (margin * 2));
      doc.text(splitReason, margin, y + 7);
    }
    
    const sigY = y + 28;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(roleLabel, margin, sigY);
    doc.text('T / TANGAN', pageWidth - margin - 40, sigY);
    doc.rect(margin, sigY + 1.5, 100, 10);
    doc.rect(pageWidth - margin - 60, sigY + 1.5, 60, 10);
    doc.text(name.toUpperCase(), margin + 2, sigY + 8);
    return sigY + 18;
  };

  currentY += 10;
  currentY = drawSigSection(`${config.reportLabel} OLEH PENJAGA PERALATAN TAPAK KERJA / PENGGUNA :`, 'NAMA PENJAGA PERALATAN TAPAK KERJA / PENGGUNA', request.staffName, currentY);
  currentY = drawSigSection(`LAPORAN OLEH PENJAGA PERALATAN MARKAS / WORKSHOP :`, 'NAMA PENJAGA PERALATAN MARKAS / WORKSHOP', storekeeperName, currentY, request.reportReason);
  currentY = drawSigSection(`PENGESAHAN JURUTERA KANAN MARKAS / PENGURUS KANAN WORKSHOP/ ODK :`, 'NAMA JURUTERA KANAN MARKAS/ PENGURUS KANAN WORKSHOP/ ODK', managerName, currentY);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('*ODK: Orang Diberi Kuasa', margin, currentY);
};

const renderQF100Form = (doc: jsPDF, request: MovementRequest, storekeeperName: string, managerName: string) => {
  const margin = 10;
  const pageWidth = doc.internal.pageSize.width;
  const isBorrow = request.type === RequestType.BORROW;

  // 1. Top Metadata Lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('REMACO IMS - REMACO (MR (MS)) - QMS - 8.1 - WI - 026', margin, 10);
  doc.text('REMACO IMS - REMACO (MR (MS)) - QMS - 8.1 - WI - 026 - QR - 001', pageWidth - margin, 10, { align: 'right' });

  // 2. Main Header Section (Using branding helper)
  drawBranding(doc, margin, 13, 1.1);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text('PERALATAN KELUAR/MASUK', pageWidth / 2, 20, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('QF.100', pageWidth - margin, 21, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(margin, 30, pageWidth - margin, 30);

  // 3. Info Block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const startY = 38;
  const rowH = 7.5;
  const labelW = 48;

  const fields = [
    { label: 'MARKAS/ WORKSHOP', value: request.base },
    { label: 'NO. KERJA', value: request.staffName + (request.staffId ? ` (${request.staffId})` : '') },
    { label: 'PROJEK', value: request.targetLocation || '' }
  ];

  fields.forEach((f, i) => {
    const y = startY + (i * rowH);
    doc.text(f.label, margin, y);
    doc.text(':', margin + labelW - 5, y);
    doc.line(margin + labelW - 2, y + 1, pageWidth - margin, y + 1);
    doc.text(f.value.toUpperCase(), margin + labelW, y);
  });

  // 4. Main Table
  const headers = [['BIL.', 'PERALATAN', 'CATATAN', 'KUANTITI\nKELUAR', 'TARIKH\nDIPULANGKAN', 'KUANTITI\nMASUK']];
  const tableBody = [];
  const MAX_ROWS = 13;
  for (let i = 0; i < Math.max(MAX_ROWS, request.items.length); i++) {
    if (i < request.items.length) {
      const item = request.items[i];
      tableBody.push([
        i + 1, 
        `${item.description}\nS/N: ${item.serialNo}`, 
        '', 
        isBorrow ? '1' : '', 
        !isBorrow ? new Date(request.timestamp).toLocaleDateString() : '', 
        !isBorrow ? '1' : ''
      ]);
    } else {
      tableBody.push(['', '', '', '', '', '']);
    }
  }

  autoTable(doc, {
    startY: 60,
    head: headers,
    body: tableBody,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8.5, lineColor: [0, 0, 0], lineWidth: 0.1, cellPadding: 2, minCellHeight: 8 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], halign: 'center', lineWidth: 0.1, fontStyle: 'normal' },
    columnStyles: { 
      0: { cellWidth: 12, halign: 'center' }, 
      1: { cellWidth: 'auto' }, 
      2: { cellWidth: 35 }, 
      3: { cellWidth: 20, halign: 'center' }, 
      4: { cellWidth: 30, halign: 'center' }, 
      5: { cellWidth: 20, halign: 'center' } 
    },
    margin: { left: margin, right: margin }
  });

  let currentY = (doc as any).lastAutoTable.finalY;
  doc.rect(margin, currentY, pageWidth - (margin * 2), 10);
  doc.text('CATATAN :', margin + 2, currentY + 6.5);

  currentY += 10;

  const sigBody = [
    ['DIKELUARKAN', 'NAMA DAN T/TANGAN JURUTERA KANAN MARKAS /\nPENGURUS KANAN WORKSHOP / ODK', managerName || 'AUTHORIZED MANAGER'],
    ['', 'NAMA DAN T/TANGAN PENGGUNA\n(PENGURUS KERJA/ POMEN/ KETUA KUMPULAN)', isBorrow ? request.staffName : ''],
    ['', 'NAMA & T/TANGAN PENJAGA PERALATAN MARKAS /\nWORKSHOP', isBorrow ? storekeeperName : 'AUTHORIZED STOREKEEPER'],
    ['DIPULANGKAN', 'NAMA DAN T/TANGAN JURUTERA KANAN MARKAS /\nPENGURUS KANAN WORKSHOP / ODK', !isBorrow ? managerName : ''],
    ['', 'NAMA DAN T/TANGAN PENGGUNA\n(PENGURUS KERJA/ POMEN/ KETUA KUMPULAN)', !isBorrow ? request.staffName : ''],
    ['', 'NAMA & T/TANGAN PENJAGA PERALATAN MARKAS /\nWORKSHOP', !isBorrow ? storekeeperName : '']
  ];

  autoTable(doc, {
    startY: currentY,
    body: sigBody,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 7, lineColor: [0, 0, 0], lineWidth: 0.1, cellPadding: 4, minCellHeight: 12 },
    columnStyles: { 
      0: { cellWidth: 35, halign: 'center', valign: 'middle', fontStyle: 'bold' }, 
      1: { cellWidth: 'auto', halign: 'left', valign: 'middle' }, 
      2: { cellWidth: 50, halign: 'center', valign: 'middle' } 
    },
    didDrawCell: (data) => {
      if (data.column.index === 0) {
        if (data.row.index === 0 || data.row.index === 3) {
        } else {
          (data.cell as any).text = '';
        }
      }
    },
    margin: { left: margin, right: margin }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(8);
  doc.text('*ODK: Orang Diberi Kuasa', margin, currentY);

  doc.setFontSize(7.5);
  doc.text('Revision: 0', margin, doc.internal.pageSize.height - 15);
  doc.text('Date of Issue: 22.03.2023', margin, doc.internal.pageSize.height - 10);
};

export const generateQF21 = (request: MovementRequest, inventory: InventoryItem[], storekeeperName: string, managerName: string = '') => {
  const doc = new jsPDF();
  
  if (request.type === RequestType.BORROW || request.type === RequestType.RETURN) {
    renderQF100Form(doc, request, storekeeperName, managerName);
    doc.save(`QF.100_${request.staffName.replace(/\s/g, '_')}.pdf`);
  } else {
    renderReportForm(doc, request, storekeeperName, managerName);
    const config = getFormConfig(request.type);
    doc.save(`${config.id}_${request.staffName.replace(/\s/g, '_')}.pdf`);
  }
};

export const generateEmptyQF = (type: RequestType) => {
  const doc = new jsPDF();
  const config = getFormConfig(type);
  
  const dummyReq: MovementRequest = {
    id: 'TEMPLATE',
    type: type,
    staffId: '',
    staffName: '_________________________',
    base: '_________________________',
    items: [],
    status: RequestStatus.APPROVED,
    timestamp: new Date().toISOString()
  };
  
  if (type === RequestType.BORROW || type === RequestType.RETURN) {
    renderQF100Form(doc, dummyReq, '_________________________', '_________________________');
    doc.save(`TEMPLATE_QF.100.pdf`);
  } else {
    renderReportForm(doc, dummyReq, '_________________________', '_________________________');
    doc.save(`TEMPLATE_${config.id}.pdf`);
  }
};