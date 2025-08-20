package com.act.backend.payload; // or your actual package

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventWithFacultyDTO {
    private Long id;
    private String name;
    private String description;
    private String date;
    private String venue;

    private Long facultyId;
    private String facultyName;
    private String facultyEmail;
    private String facultyDepartment;

    // ✅ No-args constructor is REQUIRED for Jackson
    public EventWithFacultyDTO() {}

    // ✅ All-args constructor (optional)
    public EventWithFacultyDTO(Long id, String name, String description, String date, String venue,
                               Long facultyId, String facultyName, String facultyEmail, String facultyDepartment) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.date = date;
        this.venue = venue;
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.facultyEmail = facultyEmail;
        this.facultyDepartment = facultyDepartment;
    }

    // ✅ Add Getters (required for JSON serialization)
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getDate() { return date; }
    public String getVenue() { return venue; }
    public Long getFacultyId() { return facultyId; }
    public String getFacultyName() { return facultyName; }
    public String getFacultyEmail() { return facultyEmail; }
    public String getFacultyDepartment() { return facultyDepartment; }

    // (Setters optional if only used for response)
}
