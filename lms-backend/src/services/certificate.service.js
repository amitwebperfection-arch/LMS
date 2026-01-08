const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Certificate PDF - Exact match to provided design
 * @param {Object} certificate - Certificate document
 * @param {Object} user - User document
 * @param {Object} course - Course document (with instructor populated)
 * @returns {Promise<string>} - Generated filename
 */
const generateCertificatePDF = async (certificate, user, course) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads/certificates');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created certificates directory');
      }

      const fileName = `certificate-${certificate.certificateId}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      console.log('Generating PDF at:', filePath);

      // Create PDF with exact A4 landscape dimensions
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;   // 841.89
      const pageHeight = doc.page.height; // 595.28

      // ========================================
      // OUTER BLACK BORDER
      // ========================================
      doc
        .rect(0, 0, pageWidth, pageHeight)
        .fill('#000000');

      // ========================================
      // WHITE INNER AREA
      // ========================================
      doc
        .rect(20, 20, pageWidth - 40, pageHeight - 40)
        .fill('#FFFFFF');

      // ========================================
      // MAROON/DARK RED DECORATIVE BORDER
      // ========================================
      // Top border with triangular corners
      doc
        .polygon(
          [40, 40],
          [pageWidth - 40, 40],
          [pageWidth - 40, 60],
          [pageWidth - 80, 80],
          [80, 80],
          [40, 60]
        )
        .fill('#16a34a');

      // Bottom border with triangular corners
      doc
        .polygon(
          [40, pageHeight - 40],
          [pageWidth - 40, pageHeight - 40],
          [pageWidth - 40, pageHeight - 60],
          [pageWidth - 80, pageHeight - 80],
          [80, pageHeight - 80],
          [40, pageHeight - 60]
        )
        .fill('#16a34a');

      // Left border
      doc
        .polygon(
          [40, 40],
          [60, 40],
          [80, 80],
          [80, pageHeight - 80],
          [60, pageHeight - 40],
          [40, pageHeight - 40]
        )
        .fill('#16a34a');

      // Right border
      doc
        .polygon(
          [pageWidth - 40, 40],
          [pageWidth - 60, 40],
          [pageWidth - 80, 80],
          [pageWidth - 80, pageHeight - 80],
          [pageWidth - 60, pageHeight - 40],
          [pageWidth - 40, pageHeight - 40]
        )
        .fill('#16a34a');

      // ========================================
      // GOLDEN CORNER TRIANGLES
      // ========================================
      // Top-left corner
      doc
        .polygon([40, 60], [80, 60], [80, 80], [60, 80], [40, 60])
        .fill('#FFD700');

      // Top-right corner
      doc
        .polygon([pageWidth - 40, 60], [pageWidth - 80, 60], [pageWidth - 80, 80], [pageWidth - 60, 80])
        .fill('#FFD700');

      // Bottom-left corner
      doc
        .polygon([40, pageHeight - 60], [80, pageHeight - 60], [80, pageHeight - 80], [60, pageHeight - 80])
        .fill('#FFD700');

      // Bottom-right corner
      doc
        .polygon([pageWidth - 40, pageHeight - 60], [pageWidth - 80, pageHeight - 60], [pageWidth - 80, pageHeight - 80], [pageWidth - 60, pageHeight - 80])
        .fill('#FFD700');

      // ========================================
      // INNER CONTENT BORDER
      // ========================================
      doc
        .rect(90, 90, pageWidth - 180, pageHeight - 180)
        .lineWidth(2)
        .stroke('#16a34a');

      // ========================================
      // TITLE "CERTIFICATE"
      // ========================================
      doc
        .fontSize(50)
        .font('Helvetica-Bold')
        .fillColor('#2C1810')
        .text('CERTIFICATE', 0, 130, {
          align: 'center',
          width: pageWidth
        });

      // ========================================
      // SUBTITLE "OF COMPLETION"
      // ========================================
      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor('#666666')
        .text('OF COMPLETION', 0, 190, {
          align: 'center',
          width: pageWidth
        });

      // ========================================
      // "THIS CERTIFICATE IS PROUDLY PRESENTED TO"
      // ========================================
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#555555')
        .text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', 0, 230, {
          align: 'center',
          width: pageWidth
        });

      // ========================================
      // STUDENT NAME (Large, Bold)
      // ========================================
      doc
        .fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(user.name, 0, 260, {
          align: 'center',
          width: pageWidth
        });

      // ========================================
      // "for successfully completing the course"
      // ========================================
      doc
        .fontSize(12)
        .font('Helvetica-Oblique')
        .fillColor('#555555')
        .text('for successfully completing the course', 0, 310, {
          align: 'center',
          width: pageWidth
        });

      // ========================================
      // COURSE TITLE
      // ========================================
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#8B0000')
        .text(course.title, 100, 340, {
          align: 'center',
          width: pageWidth - 200
        });

      // ========================================
      // INSTRUCTOR NAME
      // ========================================
      const instructorName = course.instructor?.name || 'Course Instructor';
      
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Instructor: ${instructorName}`, 0, 380, {
          align: 'center',
          width: pageWidth
        });

      // ========================================
      // BOTTOM SECTION - Three Columns
      // ========================================
      const bottomY = 450;
      
      // Left: DATE
      const leftX = 150;
      doc
        .moveTo(leftX, bottomY)
        .lineTo(leftX + 120, bottomY)
        .stroke('#333333');

      const issueDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#000000')
        .text(issueDate, leftX, bottomY + 8, {
          width: 120,
          align: 'center'
        });

      doc
        .fontSize(9)
        .fillColor('#666666')
        .text('Date', leftX, bottomY + 25, {
          width: 120,
          align: 'center'
        });

      // Center: INSTRUCTOR SIGNATURE
      const centerX = (pageWidth / 2) - 80;
      doc
        .moveTo(centerX, bottomY)
        .lineTo(centerX + 160, bottomY)
        .stroke('#333333');

      doc
        .fontSize(11)
        .font('Times-Italic')
        .fillColor('#000000')
        .text(instructorName, centerX, bottomY + 8, {
          width: 160,
          align: 'center'
        });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#666666')
        .text('For LMS Platform', centerX, bottomY + 25, {
          width: 160,
          align: 'center'
        });

      // Right: PLATFORM SIGNATURE
      const rightX = pageWidth - 270;
      doc
        .moveTo(rightX, bottomY)
        .lineTo(rightX + 120, bottomY)
        .stroke('#333333');

      doc
        .fontSize(11)
        .font('Times-Italic')
        .fillColor('#000000')
        .text('LMS Admin', rightX, bottomY + 8, {
          width: 120,
          align: 'center'
        });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#666666')
        .text('For LMS Platform', rightX, bottomY + 25, {
          width: 120,
          align: 'center'
        });

      // ========================================
      // CERTIFICATE ID (Small at bottom)
      // ========================================
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#fff')
        .text(`Certificate ID: ${certificate.certificateId}`, 0, pageHeight - 70, {
          align: 'center',
          width: pageWidth
        });

      // ========================================
      // VERIFICATION URL
      // ========================================
      doc
        .fontSize(8)
        .fillColor('#fff')
        .text(`Verify at: ${certificate.verificationUrl}`, 0, pageHeight - 55, {
          align: 'center',
          width: pageWidth,
          link: certificate.verificationUrl,
          underline: true
        });

      // ========================================
      // FINALIZE PDF
      // ========================================
      doc.end();

      stream.on('finish', () => {
        console.log('✅ Certificate PDF generated:', fileName);
        resolve(fileName);
      });

      stream.on('error', (error) => {
        console.error('❌ PDF generation error:', error);
        reject(error);
      });

    } catch (error) {
      console.error('Certificate generation error:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateCertificatePDF,
};