package com.smartcampus.eventsystem.controller;

import com.smartcampus.eventsystem.model.Event;
import com.smartcampus.eventsystem.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import com.smartcampus.eventsystem.service.RegistrationService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EventRestController {

    @Autowired
    private EventService eventService;

    @Autowired
    private RegistrationService registrationService;

    @GetMapping("/events")
    public List<Event> getAllEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword) {
        return eventService.getEventsWithFilters(date, department, type, keyword);
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return event != null ? ResponseEntity.ok(event) : ResponseEntity.notFound().build();
    }

    @PostMapping("/admin/events")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.saveEvent(event));
    }

    @PutMapping("/admin/events/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        event.setId(id);
        return ResponseEntity.ok(eventService.saveEvent(event));
    }

    @DeleteMapping("/admin/events/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/statistics")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        List<Event> allEvents = eventService.getAllEvents();
        int totalEvents = allEvents.size();
        
        int totalRegistrations = 0;
        int maxReg = -1;
        String topEventName = "None";
        
        for (Event e : allEvents) {
            int count = registrationService.getRegistrationCountForEvent(e.getId());
            totalRegistrations += count;
            if (count > maxReg) {
                maxReg = count;
                topEventName = e.getTitle();
            }
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", totalEvents);
        stats.put("totalRegistrations", totalRegistrations);
        stats.put("topEventName", topEventName);
        
        return ResponseEntity.ok(stats);
    }
}
