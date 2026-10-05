const printReport = (reportElement, title) => {
    if (!reportElement) return false;

    const printWindow = window.open('about:blank', '_blank');
    if (!printWindow) return false;

    const stylesheetLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map((link) => `<link rel="stylesheet" href="${link.href}">`)
        .join('');
    const styles = Array.from(document.querySelectorAll('style'))
        .map((style) => style.outerHTML)
        .join('');

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${title}</title>
                ${stylesheetLinks}
                ${styles}
                <style>
                    @page { margin: 0; }
                    html, body { min-height: 100%; margin: 0; color: #111827; font-family: Arial, sans-serif; }
                    body, body * { visibility: visible !important; opacity: 1 !important; }
                    body { overflow: visible !important; }
                    .report-print-root { box-sizing: border-box; min-height: 100vh; padding: 10mm 10mm 25mm !important; }
                    .report-print-footer {
                        position: fixed !important;
                        right: 10mm;
                        bottom: 8mm;
                        left: 10mm;
                        margin: 0 !important;
                        background: #fff;
                    }
                    .print\\:hidden { display: none !important; }
                    table { border-collapse: collapse; }
                    thead { display: table-header-group; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                </style>
            </head>
            <body>
                <div class="report-print-root">${reportElement.innerHTML}</div>
            </body>
        </html>`);

    let hasStartedPrinting = false;
    const startPrinting = () => {
        if (hasStartedPrinting) return;
        hasStartedPrinting = true;
        printWindow.focus();
        printWindow.print();
    };

    printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true });
    printWindow.addEventListener('load', () => {
        printWindow.document.fonts.ready.then(startPrinting).catch(startPrinting);
    }, { once: true });
    window.setTimeout(startPrinting, 1000);
    printWindow.document.close();

    return true;
};

export default printReport;
