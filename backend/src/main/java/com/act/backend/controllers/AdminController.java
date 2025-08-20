package com.act.backend.controllers;

import com.act.backend.models.*;
import com.act.backend.repositories.*;
import com.act.backend.dto.*;
import com.act.backend.services.EmailService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminRepository adminRepo;
    private final FacultyRepository facultyRepo;
    private final EventRepository eventRepo;
    private final StudentRepository studentRepo;
    private final EmailService emailService;
    private final StudentEventRepository studentEventRepo;

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
        Optional<Admin> adminOpt = adminRepo.findByEmail(req.getEmail());
        if (adminOpt.isPresent() && adminOpt.get().getPassword().equals(req.getPassword())) {
            session.setAttribute("admin", adminOpt.get());
            return ResponseEntity.ok(adminOpt.get()); // return Admin object
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }

    // PROFILE
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpSession session) {
        Admin admin = (Admin) session.getAttribute("admin");
        if (admin == null) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.ok(admin);
    }

    @PutMapping("/update")
public ResponseEntity<Admin> updateProfile(HttpSession session, @RequestBody Admin updated) {
    Admin admin = (Admin) session.getAttribute("admin");
    if (admin == null) return ResponseEntity.status(401).build();

    // ✅ use username not name
    admin.setUsername(updated.getUsername());
    admin.setEmail(updated.getEmail());

    return ResponseEntity.ok(adminRepo.save(admin));
}



    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(HttpSession session,
                                            @RequestBody Map<String, String> body) {
        Admin admin = (Admin) session.getAttribute("admin");
        if (admin == null) return ResponseEntity.status(401).body("Not logged in");
        if (!admin.getPassword().equals(body.get("currentPassword")))
            return ResponseEntity.status(400).body("Current password incorrect");
        admin.setPassword(body.get("newPassword"));
        adminRepo.save(admin);
        return ResponseEntity.ok("Password updated");
    }

    // FACULTY APPROVALS
    @GetMapping("/unapproved-faculties")
    public List<Faculty> getUnapprovedFaculties() {
        return facultyRepo.findAll().stream().filter(f -> !f.isApproved()).toList();
    }

    @PutMapping("/approve-faculty/{id}")
public ResponseEntity<String> approveFaculty(@PathVariable Long id) {
    Faculty f = facultyRepo.findById(id).orElseThrow();
    f.setApproved(true);
    facultyRepo.save(f);

    // ✅ send correct frontend link for password setup
    String link = "http://localhost:5173/faculty/set-password?email=" + f.getEmail();
    emailService.sendEmail(
            f.getEmail(),
            "Faculty Approval",
            "Congratulations! Your registration has been approved. Please set your password here: " + link
    );

    return ResponseEntity.ok("Faculty approved and email sent");
}

@PutMapping("/reject-faculty/{id}")
public ResponseEntity<String> rejectFaculty(@PathVariable Long id, @RequestParam String reason) {
    Faculty f = facultyRepo.findById(id).orElseThrow();

    // ✅ send rejection email first
    emailService.sendEmail(
            f.getEmail(),
            "Faculty Registration Rejected",
            "We regret to inform you that your registration was rejected.\nReason: " + reason
    );

    // then remove faculty
    facultyRepo.delete(f);

    return ResponseEntity.ok("Faculty rejected and email sent");
}


    @GetMapping("/faculties")
public List<FacultyDTO> getAllFaculties() {
    return facultyRepo.findAll().stream().map(f -> new FacultyDTO(
        f.getId(),
        f.getName(),
        f.getEmail(),
        f.getPhone(),
        f.getDepartment(),
        f.getGender(),
        f.isApproved()
    )).toList();
}


    // STUDENTS
    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

   @PostMapping("/create-event")
public ResponseEntity<Event> addEvent(@RequestBody Map<String, Object> body) {
    String name = (String) body.get("name");
    String venue = (String) body.get("venue");
    String date = (String) body.get("date");
    String description = (String) body.get("description"); // <-- add this
    Long facultyId = body.get("facultyId") != null ? Long.valueOf(body.get("facultyId").toString()) : null;

    Event event = new Event();
    event.setName(name);
    event.setVenue(venue);
    event.setDate(date);
    event.setDescription(description); // <-- set it here

    if (facultyId != null) {
        Faculty faculty = facultyRepo.findById(facultyId).orElse(null);
        if (faculty != null) {
            event.setFaculty(faculty);
            emailService.sendEmail(
                faculty.getEmail(),
                "New Event Assigned",
                "You have been assigned to event: " + name + " on " + date
            );
        }
    }

    Event saved = eventRepo.save(event);
    return ResponseEntity.ok(saved);
}



    @GetMapping("/events")
public List<EventDTO> getAllEvents() {
    return eventRepo.findAll().stream().map(e -> {
        EventDTO dto = new EventDTO();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setDescription(e.getDescription());
        dto.setDate(e.getDate());
        dto.setVenue(e.getVenue());
        dto.setFacultyName(e.getFaculty() != null ? e.getFaculty().getName() : "Unassigned");
        return dto;
    }).toList();
}

@GetMapping("/events/{eventId}/students")
public ResponseEntity<?> getStudentsByEvent(@PathVariable Long eventId) {
    Event event = eventRepo.findById(eventId).orElse(null);
    if (event == null) {
        return ResponseEntity.status(404).body("Event not found");
    }

    List<StudentEvent> studentEvents = studentEventRepo.findByEvent(event);

    List<StudentAttendanceDTO> response = studentEvents.stream().map(se -> {
        Student s = se.getStudent();
        return new StudentAttendanceDTO(
                s.getId(),
                s.getName(),
                s.getEmail(),
                s.getPhone(),
                s.getDepartment(),
                se.getAttendance()
        );
    }).toList();

    return ResponseEntity.ok(response);
}





}
