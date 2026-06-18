package com.smartcampus.eventsystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("youremail@gmail.com");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send real email to " + to + ". Please check application.properties or mail server configuration.");
        }
    }
}
