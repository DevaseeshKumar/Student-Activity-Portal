package com.act.backend.controllers;

import com.act.backend.dto.EventDTO;
import com.act.backend.models.Event;
import com.act.backend.models.Student;
import com.act.backend.models.StudentEvent;
import com.act.backend.repositories.EventRepository;
import com.act.backend.repositories.StudentRepository;
import com.act.backend.repositories.StudentEventRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepo;
    private final EventRepository eventRepo;
    private final StudentEventRepository studentEventRepo;

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Student student) {
        if (studentRepo.findByEmail(student.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        studentRepo.save(student);
        return ResponseEntity.ok("Signup successful");
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> body, HttpSession session) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<Student> sOpt = studentRepo.findByEmail(email);
        if (sOpt.isPresent() && sOpt.get().getPassword().equals(password)) {
            session.setAttribute("student", sOpt.get());
            return ResponseEntity.ok("Login successful");
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }

    // GET PROFILE
    @GetMapping("/profile")
    public ResponseEntity<Student> getProfile(HttpSession session) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(s);
    }

    // ✅ REGISTER EVENT
    @PostMapping("/register-event/{eventId}")
    public ResponseEntity<String> registerEvent(HttpSession session, @PathVariable Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) return ResponseEntity.status(401).build();

        Event e = eventRepo.findById(eventId).orElseThrow();

        // check if already registered
        if (studentEventRepo.existsByStudentAndEvent(s, e)) {
            return ResponseEntity.badRequest().body("Already registered for this event");
        }

        StudentEvent se = new StudentEvent();
        se.setStudent(s);
        se.setEvent(e);
        se.setAttendance(null); // initially null
        studentEventRepo.save(se);

        return ResponseEntity.ok("Event registered successfully");
    }

    // ✅ UNREGISTER EVENT
    @PostMapping("/unregister-event/{eventId}")
    public ResponseEntity<String> unregisterEvent(HttpSession session, @PathVariable Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) return ResponseEntity.status(401).build();

        Event e = eventRepo.findById(eventId).orElseThrow();

        Optional<StudentEvent> seOpt = studentEventRepo.findByStudentAndEvent(s, e);
        if (seOpt.isPresent()) {
            studentEventRepo.delete(seOpt.get());
            return ResponseEntity.ok("Unregistered from event");
        } else {
            return ResponseEntity.badRequest().body("Event was not registered");
        }
    }

    // GET ALL EVENTS
    @GetMapping("/events")
    public List<EventDTO> getAllEvents() {
        return eventRepo.findAll().stream()
            .map(e -> new EventDTO(
                e.getId(),
                e.getName(),
                e.getDescription(),
                e.getDate(),
                e.getVenue(),
                e.getFaculty() != null ? e.getFaculty().getName() : "Unassigned",
                e.getFaculty() != null ? e.getFaculty().getEmail() : null,
                e.getFaculty() != null ? e.getFaculty().getDepartment() : null
            ))
            .toList();
    }

    // ✅ GET REGISTERED EVENTS
@GetMapping("/registered-events")
public ResponseEntity<List<EventDTO>> getRegisteredEvents(HttpSession session) {
    Student s = (Student) session.getAttribute("student");
    if (s == null) return ResponseEntity.status(401).build();

    List<StudentEvent> registrations = studentEventRepo.findByStudent(s);

    List<EventDTO> dtos = registrations.stream()
        .map(se -> {
            Event e = se.getEvent();
            return new EventDTO(
                e.getId(),
                e.getName(),
                e.getDescription(),
                e.getDate(),
                e.getVenue(),
                e.getFaculty() != null ? e.getFaculty().getName() : "Unassigned",
                e.getFaculty() != null ? e.getFaculty().getEmail() : null,
                e.getFaculty() != null ? e.getFaculty().getDepartment() : null
            );
        })
        .toList();

    return ResponseEntity.ok(dtos);
}


    // ✅ VIEW ATTENDANCE FOR A STUDENT EVENT
    @GetMapping("/events/{eventId}/attendance")
    public ResponseEntity<Boolean> getAttendance(HttpSession session,
                                                 @PathVariable Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) return ResponseEntity.status(401).build();

        Boolean attendance = studentEventRepo.findAttendance(eventId, s.getId());
        return ResponseEntity.ok(attendance);
    }
}
