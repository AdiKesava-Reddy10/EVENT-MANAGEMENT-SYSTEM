package com.smartcampus.eventsystem.controller;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import com.smartcampus.eventsystem.model.Registration;
import com.smartcampus.eventsystem.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.Optional;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "*")
public class CertificateController {

    @Autowired
    private RegistrationRepository registrationRepository;

    @GetMapping("/download/{regId}")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long regId) {
        Optional<Registration> regOpt = registrationRepository.findById(regId);
        if (regOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Registration reg = regOpt.get();
        // Allow download if event is in the past OR user attended
        if (!reg.getEvent().getDate().isBefore(java.time.LocalDate.now()) && !reg.isAttended()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Not completed
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, baos);
            document.open();

            // Add background/border styling
            document.add(new Paragraph("\n\n"));

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 36, BaseColor.BLUE);
            Paragraph title = new Paragraph("CERTIFICATE OF COMPLETION", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph("\n\n"));

            Font regular = FontFactory.getFont(FontFactory.HELVETICA, 18, BaseColor.BLACK);
            Paragraph p1 = new Paragraph("This is to certify that", regular);
            p1.setAlignment(Element.ALIGN_CENTER);
            document.add(p1);

            document.add(new Paragraph("\n"));

            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, BaseColor.DARK_GRAY);
            Paragraph name = new Paragraph(reg.getStudentName(), nameFont);
            name.setAlignment(Element.ALIGN_CENTER);
            document.add(name);

            document.add(new Paragraph("\n"));

            Paragraph p2 = new Paragraph("has successfully completed the event", regular);
            p2.setAlignment(Element.ALIGN_CENTER);
            document.add(p2);

            document.add(new Paragraph("\n"));

            Font eventFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 24, BaseColor.RED);
            Paragraph eventName = new Paragraph(reg.getEvent().getTitle(), eventFont);
            eventName.setAlignment(Element.ALIGN_CENTER);
            document.add(eventName);

            document.add(new Paragraph("\n\n"));
            Paragraph p3 = new Paragraph("Held on " + reg.getEvent().getDate() + " at " + reg.getEvent().getLocation(), regular);
            p3.setAlignment(Element.ALIGN_CENTER);
            document.add(p3);

            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Certificate_" + reg.getEvent().getTitle().replaceAll("\\s+", "_") + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(baos.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
