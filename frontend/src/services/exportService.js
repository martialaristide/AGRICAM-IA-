/**
 * AGRICAM IA - Export Service
 * Generate PDF and Word documents for reports
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType } from 'docx';
import { saveAs } from 'file-saver';

// Logo URL
const LOGO_URL = '/branding/agricam-logo.png';

/**
 * Export data to PDF
 */
export async function exportToPDF(data, type, title) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(5, 150, 105); // Emerald color
  doc.text('AGRICAM IA', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Agriculture de précision intelligente', 14, 27);
  
  // Title
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 40);
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 48);
  
  // Content based on type
  let startY = 55;
  
  switch (type) {
    case 'parcelles':
      startY = exportParcellesPDF(doc, data, startY);
      break;
    case 'capteurs':
      startY = exportCapteursPDF(doc, data, startY);
      break;
    case 'analytics':
      startY = exportAnalyticsPDF(doc, data, startY);
      break;
    case 'recommendations':
      startY = exportRecommendationsPDF(doc, data, startY);
      break;
    default:
      doc.text('Données non disponibles', 14, startY);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('© 2024 African AI Solutions - Développé par Barra Martial Aristide', 14, pageHeight - 10);
  doc.text(`Page 1`, pageWidth - 20, pageHeight - 10);
  
  // Save
  doc.save(`agricam-${type}-${Date.now()}.pdf`);
}

function exportParcellesPDF(doc, parcelles, startY) {
  if (!parcelles || parcelles.length === 0) {
    doc.text('Aucune parcelle trouvée', 14, startY);
    return startY + 10;
  }
  
  const tableData = parcelles.map(p => [
    p.name || '-',
    p.culture_type || '-',
    `${p.surface_hectares || 0} ha`,
    p.location || '-',
    p.status || '-'
  ]);
  
  doc.autoTable({
    startY: startY,
    head: [['Nom', 'Culture', 'Surface', 'Localisation', 'Statut']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 9 }
  });
  
  return doc.lastAutoTable.finalY + 10;
}

function exportCapteursPDF(doc, capteurs, startY) {
  if (!capteurs || capteurs.length === 0) {
    doc.text('Aucun capteur trouvé', 14, startY);
    return startY + 10;
  }
  
  const tableData = capteurs.map(s => [
    s.name || '-',
    s.type || '-',
    s.status || '-',
    `${s.battery_level || 0}%`,
    s.last_value ? `${s.last_value}` : '-'
  ]);
  
  doc.autoTable({
    startY: startY,
    head: [['Nom', 'Type', 'Statut', 'Batterie', 'Dernière valeur']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 9 }
  });
  
  return doc.lastAutoTable.finalY + 10;
}

function exportAnalyticsPDF(doc, analytics, startY) {
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  
  const stats = [
    ['Utilisateurs totaux', analytics.total_users || 0],
    ['Utilisateurs actifs (24h)', analytics.active_users || 0],
    ['Parcelles', analytics.total_parcels || 0],
    ['Capteurs IoT', analytics.total_sensors || 0],
    ['Analyses IA', analytics.total_analyses || 0],
    ['Revenus (XAF)', analytics.total_revenue || 0]
  ];
  
  doc.autoTable({
    startY: startY,
    head: [['Métrique', 'Valeur']],
    body: stats,
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 10 }
  });
  
  return doc.lastAutoTable.finalY + 10;
}

function exportRecommendationsPDF(doc, recommendations, startY) {
  if (!recommendations || recommendations.length === 0) {
    doc.text('Aucune recommandation trouvée', 14, startY);
    return startY + 10;
  }
  
  const tableData = recommendations.map(r => [
    r.title || '-',
    r.type || '-',
    r.priority || '-',
    r.parcel_name || '-'
  ]);
  
  doc.autoTable({
    startY: startY,
    head: [['Titre', 'Type', 'Priorité', 'Parcelle']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 9 }
  });
  
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Export data to Word document
 */
export async function exportToWord(data, type, title) {
  let sections = [];
  
  // Title
  sections.push(
    new Paragraph({
      text: 'AGRICAM IA',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: 'Agriculture de précision intelligente',
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      spacing: { after: 400 }
    })
  );
  
  // Content based on type
  switch (type) {
    case 'parcelles':
      sections = sections.concat(exportParcellesWord(data));
      break;
    case 'capteurs':
      sections = sections.concat(exportCapteursWord(data));
      break;
    case 'analytics':
      sections = sections.concat(exportAnalyticsWord(data));
      break;
    case 'recommendations':
      sections = sections.concat(exportRecommendationsWord(data));
      break;
    default:
      sections.push(new Paragraph({ text: 'Données non disponibles' }));
  }
  
  // Footer
  sections.push(
    new Paragraph({
      text: '',
      spacing: { before: 800 }
    }),
    new Paragraph({
      text: '© 2024 African AI Solutions - Développé par Barra Martial Aristide',
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 }
    })
  );
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });
  
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `agricam-${type}-${Date.now()}.docx`);
}

function exportParcellesWord(parcelles) {
  if (!parcelles || parcelles.length === 0) {
    return [new Paragraph({ text: 'Aucune parcelle trouvée' })];
  }
  
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Nom', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Culture', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Surface', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Localisation', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Statut', bold: true })] })
      ]
    }),
    ...parcelles.map(p => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: p.name || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: p.culture_type || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: `${p.surface_hectares || 0} ha` })] }),
        new TableCell({ children: [new Paragraph({ text: p.location || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: p.status || '-' })] })
      ]
    }))
  ];
  
  return [
    new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  ];
}

function exportCapteursWord(capteurs) {
  if (!capteurs || capteurs.length === 0) {
    return [new Paragraph({ text: 'Aucun capteur trouvé' })];
  }
  
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Nom', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Type', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Statut', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Batterie', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Dernière valeur', bold: true })] })
      ]
    }),
    ...capteurs.map(s => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: s.name || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: s.type || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: s.status || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: `${s.battery_level || 0}%` })] }),
        new TableCell({ children: [new Paragraph({ text: s.last_value ? `${s.last_value}` : '-' })] })
      ]
    }))
  ];
  
  return [
    new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  ];
}

function exportAnalyticsWord(analytics) {
  const stats = [
    ['Utilisateurs totaux', analytics.total_users || 0],
    ['Utilisateurs actifs (24h)', analytics.active_users || 0],
    ['Parcelles', analytics.total_parcels || 0],
    ['Capteurs IoT', analytics.total_sensors || 0],
    ['Analyses IA', analytics.total_analyses || 0],
    ['Revenus (XAF)', analytics.total_revenue || 0]
  ];
  
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Métrique', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Valeur', bold: true })] })
      ]
    }),
    ...stats.map(([metric, value]) => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: metric })] }),
        new TableCell({ children: [new Paragraph({ text: String(value) })] })
      ]
    }))
  ];
  
  return [
    new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  ];
}

function exportRecommendationsWord(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return [new Paragraph({ text: 'Aucune recommandation trouvée' })];
  }
  
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Titre', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Type', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Priorité', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Parcelle', bold: true })] })
      ]
    }),
    ...recommendations.map(r => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: r.title || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: r.type || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: r.priority || '-' })] }),
        new TableCell({ children: [new Paragraph({ text: r.parcel_name || '-' })] })
      ]
    }))
  ];
  
  return [
    new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  ];
}

/**
 * Export to CSV
 */
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}-${Date.now()}.csv`);
}

/**
 * Export data to Excel (XLSX)
 */
export function exportToExcel(data, filename) {
  try {
    const XLSX = require('xlsx');
    const rows = Array.isArray(data) ? data : [data];
    if (rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapport");
    XLSX.writeFile(wb, `${filename}-${Date.now()}.xlsx`);
  } catch (e) {
    console.error("Excel export error:", e);
    // Fallback to CSV
    exportToCSV(data, filename);
  }
}

export default {
  exportToPDF,
  exportToWord,
  exportToCSV,
  exportToExcel
};
