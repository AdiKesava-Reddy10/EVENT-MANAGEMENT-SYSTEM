package com.smartcampus.eventsystem.controller;

import com.smartcampus.eventsystem.model.Event;
import com.smartcampus.eventsystem.model.Registration;
import com.smartcampus.eventsystem.service.EventService;
import com.smartcampus.eventsystem.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/legacy-admin")
public class AdminController {

    @Autowired
    private EventService eventService;

    @Autowired
    private RegistrationService registrationService;

    @GetMapping
    public String adminDashboard(Model model) {
        
        List<Event> allEvents = eventService.getAllEvents();
        int totalEvents = allEvents.size();
        
        int totalRegistrations = 0;
        String topEventName = "None";
        int maxReg = -1;
        
        Map<Long, Integer> regCounts = new HashMap<>();
        
        for (Event e : allEvents) {
            int count = registrationService.getRegistrationCountForEvent(e.getId());
            regCounts.put(e.getId(), count);
            totalRegistrations += count;
            if (count > maxReg) {
                maxReg = count;
                topEventName = e.getTitle();
            }
        }
        
        // Let's just fetch all registrations and reverse it for "recent"
        // In a real app we'd have a repository method order by date desc
        // We'll just proxy it for now since we don't have Registrationdate added yet
        // However, I can add findAll() to reg service and show them.

        List<String> eventLabels = allEvents.stream().map(Event::getTitle).collect(Collectors.toList());
        List<Integer> eventRegistrationsData = allEvents.stream()
                .map(e -> registrationService.getRegistrationCountForEvent(e.getId()))
                .collect(Collectors.toList());

        model.addAttribute("totalEvents", totalEvents);
        model.addAttribute("totalRegistrations", totalRegistrations);
        model.addAttribute("topEventName", topEventName);
        model.addAttribute("recentMonthRegistrations", totalRegistrations); // Placeholder stat
        
        model.addAttribute("events", allEvents);
        model.addAttribute("regCounts", regCounts);
        model.addAttribute("eventLabels", eventLabels);
        model.addAttribute("eventRegistrationsData", eventRegistrationsData);
        
        return "admin-dashboard";
    }

    @GetMapping("/event/new")
    public String showAddEventForm(Model model) {
        if (!model.containsAttribute("event")) {
            model.addAttribute("event", new Event());
        }
        return "admin-event-form";
    }

    @PostMapping("/event/save")
    public String saveEvent(@Valid @ModelAttribute("event") Event event,
                            BindingResult bindingResult,
                            RedirectAttributes redirectAttributes) {
        
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.event", bindingResult);
            redirectAttributes.addFlashAttribute("event", event);
            return "redirect:/admin/event/new";
        }
        
        eventService.saveEvent(event);
        redirectAttributes.addFlashAttribute("successMessage", "Event saved successfully!");
        return "redirect:/admin";
    }

    @GetMapping("/event/edit/{id}")
    public String showEditEventForm(@PathVariable("id") Long id, Model model) {
        if (!model.containsAttribute("event")) {
            Event event = eventService.getEventById(id);
            model.addAttribute("event", event);
        }
        return "admin-event-form";
    }

    @PostMapping("/event/update")
    public String updateEvent(@Valid @ModelAttribute("event") Event event,
                              BindingResult bindingResult,
                              RedirectAttributes redirectAttributes) {
        
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.event", bindingResult);
            redirectAttributes.addFlashAttribute("event", event);
            return "redirect:/admin/event/edit/" + event.getId();
        }
        
        eventService.saveEvent(event);
        redirectAttributes.addFlashAttribute("successMessage", "Event updated successfully!");
        return "redirect:/admin";
    }

    @GetMapping("/event/delete/{id}")
    public String deleteEvent(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        eventService.deleteEvent(id);
        redirectAttributes.addFlashAttribute("successMessage", "Event deleted successfully!");
        return "redirect:/admin";
    }
}
