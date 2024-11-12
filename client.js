const socket = io();
let currentPage = 1;
let pdfDoc = null;
let totalPages = 0;  // Store total pages to avoid accessing 'numPages' before PDF is loaded
const canvas = document.getElementById('pdf-render');
const ctx = canvas.getContext('2d');

// Set worker source for PDF.js (CDN path)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

// Load the PDF
const url = 'sample.pdf';  // Ensure this matches the actual path and filename in 'public'
pdfjsLib.getDocument(url).promise.then(pdf => {
    pdfDoc = pdf;
    totalPages = pdf.numPages; // Store the total number of pages after PDF is loaded
    renderPage(currentPage);
}).catch(error => {
    console.error("Error loading PDF: ", error);
});

function renderPage(pageNumber) {
    if (!pdfDoc) return;  // Check if PDF is loaded

    pdfDoc.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({ canvasContext: ctx, viewport: viewport }).promise.catch(error => {
            console.error("Error rendering page: ", error);
        });
    });
}

// Handle page navigation for the admin
document.getElementById('prev').addEventListener('click', () => {
    if (currentPage <= 1) return;  // Prevent going below page 1
    currentPage--;
    renderPage(currentPage);
    socket.emit('pageChange', currentPage); // Notify server of the page change
});

document.getElementById('next').addEventListener('click', () => {
    if (currentPage >= totalPages) return;  // Prevent going beyond total pages
    currentPage++;
    renderPage(currentPage);
    socket.emit('pageChange', currentPage); // Notify server of the page change
});

// Listen for page changes from the server
socket.on('pageChange', (newPage) => {
    currentPage = newPage;
    renderPage(currentPage);
});
