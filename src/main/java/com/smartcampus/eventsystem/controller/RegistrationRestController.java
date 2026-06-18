package com.smartcampus.eventsystem.controller;

import com.smartcampus.eventsystem.model.Registration;
import com.smartcampus.eventsystem.model.User;
import com.smartcampus.eventsystem.service.RegistrationService;
import com.smartcampus.eventsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*")
public class RegistrationRestController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<Registration> getMyRegistrations(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        return registrationService.getRegistrationsByUserId(user.getId());
    }

    @Autowired
    private com.smartcampus.eventsystem.service.EmailService emailService;

    @Autowired
    private com.smartcampus.eventsystem.service.EventService eventService;

    @PostMapping("/register/{eventId}")
    public ResponseEntity<?> registerForEvent(@PathVariable Long eventId, @RequestBody Registration request, Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        if (user == null || user.getId() == null) {
            throw new RuntimeException("Invalid user session or missing user ID. Please login again.");
        }
        Registration reg = registrationService.registerUserForEvent(user, eventId, request);
        
        // Send email notification
        String recipientEmail = request.getStudentEmail() != null && !request.getStudentEmail().isEmpty() ? request.getStudentEmail() : user.getEmail();
        if (recipientEmail != null && !recipientEmail.isEmpty()) {
            try {
                com.smartcampus.eventsystem.model.Event event = eventService.getEventById(eventId);
                String subject = "Registration Successful: " + event.getTitle();
                String body = "Dear " + request.getStudentName() + ",\n\n" +
                              "You have successfully registered for the event: " + event.getTitle() + ".\n" +
                              "Date: " + event.getDate() + "\n" +
                              "Location: " + event.getLocation() + "\n\n" +
                              "Thank you,\nSmart Campus Team";
                emailService.sendEmail(recipientEmail, subject, body);
            } catch (Exception emailEx) {
                // Log the error but don't fail the registration
                System.err.println("Failed to send email: " + emailEx.getMessage());
            }
        }
        
        return ResponseEntity.ok(reg);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long id) {
        registrationService.cancelRegistration(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/scan")
    public ResponseEntity<?> scanTicket(@RequestParam String token) {
        try {
            Registration reg = registrationService.scanQrCode(token);
            return ResponseEntity.ok(Map.of(
                "message", "Ticket valid and checked-in successfully",
                "studentName", reg.getStudentName(),
                "eventName", reg.getEvent().getTitle()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
