package com.act.backend.controllers;

import com.act.backend.models.Faculty;
import com.act.backend.models.Student;
import com.act.backend.models.StudentEvent;
import com.act.backend.dto.EventDTO;
import com.act.backend.dto.StudentAttendanceDTO;
import com.act.backend.models.Event;
import com.act.backend.repositories.FacultyRepository;
import com.act.backend.repositories.StudentEventRepository;
import com.act.backend.repositories.StudentRepository;
import com.act.backend.repositories.EventRepository;

import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyRepository facultyRepo;
    private final EventRepository eventRepo;
    private final StudentRepository studentRepo;
    private final StudentEventRepository studentEventRepo;

    // REGISTER (initially unapproved)
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Faculty faculty) {
        faculty.setApproved(false);
        faculty.setPassword(null); // no password until approved
        facultyRepo.save(faculty);
        return ResponseEntity.ok("Faculty registered. Wait for admin approval.");
    }

    // LOGIN (only after approval + password set)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpSession session) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<Faculty> fOpt = facultyRepo.findByEmail(email);
        if (fOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        Faculty f = fOpt.get();
        if (!f.isApproved()) {
            return ResponseEntity.status(403).body("Not approved yet");
        }
        if (f.getPassword() == null) {
            return ResponseEntity.status(403).body("Password not set yet");
        }
        if (!f.getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        session.setAttribute("faculty", f);
        return ResponseEntity.ok(f); // return faculty object
    }

    // LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Faculty logged out");
    }

    // GET PROFILE
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpSession session) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        return ResponseEntity.ok(f);
    }

    // UPDATE PROFILE
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(HttpSession session, @RequestBody Faculty updated) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        f.setName(updated.getName());
        f.setPhone(updated.getPhone());
        f.setDepartment(updated.getDepartment());
        f.setGender(updated.getGender());

        Faculty saved = facultyRepo.save(f);
        session.setAttribute("faculty", saved); // update session
        return ResponseEntity.ok(saved);
    }

    // UPDATE PASSWORD
    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(HttpSession session, @RequestBody Map<String, String> body) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (f.getPassword() == null || !f.getPassword().equals(currentPassword)) {
            return ResponseEntity.badRequest().body("Current password incorrect");
        }

        f.setPassword(newPassword);
        facultyRepo.save(f);
        return ResponseEntity.ok("Password updated");
    }

    // SET PASSWORD (after approval link)
    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestParam String email, @RequestParam String password) {
        Optional<Faculty> opt = facultyRepo.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("Faculty not found");
        }

        Faculty f = opt.get();
        f.setPassword(password);
        facultyRepo.save(f);

        return ResponseEntity.ok("Password set successfully");
    }

    @GetMapping("/events")
@Transactional
public ResponseEntity<?> getAssignedEvents(HttpSession session) {
    Faculty f = (Faculty) session.getAttribute("faculty");
    if (f == null) return ResponseEntity.status(401).body("Not logged in");

    List<Event> events = f.getEventsAssigned(); // lazy-loaded
    List<EventDTO> dtoList = events.stream()
        .map(e -> new EventDTO(
            e.getId(),
            e.getName(),
            e.getDescription(),
            e.getDate(),
            e.getVenue(),
            f.getName(),        // facultyName
            f.getEmail(),       // facultyEmail
            f.getDepartment()   // facultyDepartment
        )).toList();

    return ResponseEntity.ok(dtoList);
}
@GetMapping("/events/{eventId}/students")
public ResponseEntity<List<StudentAttendanceDTO>> getStudentsByEvent(@PathVariable Long eventId,
                                                                     HttpSession session) {
    Faculty faculty = (Faculty) session.getAttribute("faculty");
    if (faculty == null) {
        return ResponseEntity.status(401).body(null);
    }

    Event event = eventRepo.findById(eventId).orElse(null);
    if (event == null) {
        return ResponseEntity.status(404).body(null);
    }

    // ✅ ensure event belongs to this faculty
    if (!event.getFaculty().getId().equals(faculty.getId())) {
        return ResponseEntity.status(403).body(null);
    }

    // ✅ fetch students with attendance
    List<StudentAttendanceDTO> students = studentEventRepo.findByEvent(event).stream()
            .map(se -> new StudentAttendanceDTO(
                    se.getStudent().getId(),
                    se.getStudent().getName(),
                    se.getStudent().getEmail(),
                    se.getStudent().getPhone(),
                    se.getStudent().getDepartment(),
                    se.getAttendance() // true, false, or null
            ))
            .toList();

    return ResponseEntity.ok(students);
}

    // ✅ Faculty marks attendance of a student for their event
@PostMapping("/events/{eventId}/attendance")
@Transactional
public ResponseEntity<?> markAttendance(@PathVariable Long eventId,
                                        @RequestParam Long studentId,
                                        @RequestParam Boolean present,
                                        HttpSession session) {
    Faculty faculty = (Faculty) session.getAttribute("faculty");
    if (faculty == null) {
        return ResponseEntity.status(401).body("Not logged in");
    }

    // ✅ check event exists
    Event event = eventRepo.findById(eventId).orElse(null);
    if (event == null) {
        return ResponseEntity.status(404).body("Event not found");
    }

    // ✅ ensure event belongs to this faculty
    if (!event.getFaculty().getId().equals(faculty.getId())) {
        return ResponseEntity.status(403).body("You are not assigned to this event");
    }

    // ✅ check if student is registered
    Optional<StudentEvent> studentEventOpt = studentEventRepo.findByStudentAndEvent(
            studentRepo.findById(studentId).orElse(null), event);

    if (studentEventOpt.isEmpty()) {
        return ResponseEntity.badRequest().body("Student not registered for this event");
    }

    // ✅ mark attendance
    studentEventRepo.updateAttendance(eventId, studentId, present);

    return ResponseEntity.ok("Attendance marked as " + (present ? "Present" : "Absent"));
}


}
