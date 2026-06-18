package com.smartcampus.eventsystem.service;

import com.smartcampus.eventsystem.model.Registration;
import com.smartcampus.eventsystem.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    public Registration registerStudent(Registration registration) {
        return registrationRepository.save(registration);
    }

    public List<Registration> getRegistrationsForEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public int getRegistrationCountForEvent(Long eventId) {
        return registrationRepository.countByEventId(eventId);
    }

    public List<Registration> getRegistrationsByUserId(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public Registration registerUserForEvent(com.smartcampus.eventsystem.model.User user, Long eventId, Registration request) {
        // Check if already registered
        List<Registration> existing = registrationRepository.findByUserId(user.getId());
        for (Registration r : existing) {
            if (r.getEvent().getId().equals(eventId)) {
                throw new RuntimeException("Already registered for this event");
            }
        }
        
        Registration reg = new Registration();
        com.smartcampus.eventsystem.model.Event event = new com.smartcampus.eventsystem.model.Event();
        event.setId(eventId);
        
        reg.setUser(user);
        reg.setEvent(event);
        reg.setStudentName(request.getStudentName());
        reg.setStudentEmail(request.getStudentEmail());
        reg.setRegistrationDate(java.time.LocalDateTime.now());
        
        // Generate a unique secure token for the QR code
        String qrToken = java.util.UUID.randomUUID().toString();
        reg.setQrToken(qrToken);
        
        return registrationRepository.save(reg);
    }

    public Registration scanQrCode(String qrToken) {
        Registration reg = registrationRepository.findByQrToken(qrToken)
            .orElseThrow(() -> new RuntimeException("Invalid QR Ticket"));
            
        if (reg.isAttended()) {
            throw new RuntimeException("Ticket already used");
        }
        
        reg.setAttended(true);
        reg.setCheckInTime(java.time.LocalDateTime.now());
        return registrationRepository.save(reg);
    }

    public void cancelRegistration(Long id) {
        registrationRepository.deleteById(id);
    }
}
