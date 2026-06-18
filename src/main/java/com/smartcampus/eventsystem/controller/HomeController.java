package com.smartcampus.eventsystem.controller;

import com.smartcampus.eventsystem.model.Event;
import com.smartcampus.eventsystem.model.Registration;
import com.smartcampus.eventsystem.service.EventService;
import com.smartcampus.eventsystem.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.format.annotation.DateTimeFormat;
import com.smartcampus.eventsystem.repository.UserRepository;
import com.smartcampus.eventsystem.model.User;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Controller
public class HomeController {

    @Autowired
    private EventService eventService;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/legacy-home")
    public String viewHomePage(@RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                               @RequestParam(value = "department", required = false) String department,
                               @RequestParam(value = "type", required = false) String type,
                               @RequestParam(value = "keyword", required = false) String keyword,
                               Model model) {
        model.addAttribute("events", eventService.getEventsWithFilters(date, department, type, keyword));
        return "index";
    }

    @GetMapping("/legacy-event/{id}")
    public String viewEventDetails(@PathVariable("id") Long id, Model model) {
        Event event = eventService.getEventById(id);
        model.addAttribute("event", event);
        
        if (!model.containsAttribute("registration")) {
            Registration registration = new Registration();
            registration.setEvent(event);
            model.addAttribute("registration", registration);
        }
        
        return "event-details";
    }

    @PostMapping("/legacy-event/register")
    public String registerForEvent(@Valid @ModelAttribute("registration") Registration registration,
                                   BindingResult bindingResult,
                                   Principal principal,
                                   RedirectAttributes redirectAttributes) {
        
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.registration", bindingResult);
            redirectAttributes.addFlashAttribute("registration", registration);
            return "redirect:/event/" + registration.getEvent().getId();
        }

        if (principal != null) {
            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            userOpt.ifPresent(registration::setUser);
        }
        registration.setRegistrationDate(LocalDateTime.now());

        registrationService.registerStudent(registration);
        redirectAttributes.addFlashAttribute("successMessage", "Successfully registered for the event!");
        
        return "redirect:/event/" + registration.getEvent().getId();
    }
}
