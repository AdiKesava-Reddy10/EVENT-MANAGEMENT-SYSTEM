package com.smartcampus.eventsystem.controller;

import com.smartcampus.eventsystem.model.Registration;
import com.smartcampus.eventsystem.model.User;
import com.smartcampus.eventsystem.repository.UserRepository;
import com.smartcampus.eventsystem.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/legacy-student")
public class StudentController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public String studentDashboard(Model model, Principal principal) {
        if (principal != null) {
            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                List<Registration> registrations = registrationService.getRegistrationsByUserId(user.getId());
                model.addAttribute("registrations", registrations);
                model.addAttribute("user", user);
            }
        }
        return "student-dashboard";
    }
}
