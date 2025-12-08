/**
 * Resume schema structure for Gemini API prompt
 * This provides the expected structure and field descriptions
 */
export const RESUME_SCHEMA_DESCRIPTION = `
Resume Schema Structure:

{
  "id": string (unique identifier, auto-generated),
  "lastUpdated": string (ISO date string),
  "name": string (resume name, typically person's full name),
  "version": number (optional, default 1),
  "contact": {
    "fullName": string (required),
    "email": string (required),
    "phone": string (optional),
    "location": {
      "street": string (optional),
      "city": string (required),
      "state": string (optional),
      "country": string (required),
      "postalCode": string (optional)
    },
    "socialLinks": {
      "linkedin": string (optional, URL),
      "github": string (optional, URL),
      "portfolio": string (optional, URL),
      "instagram": string (optional, URL)
    }
  },
  "summary": string (professional summary/objective),
  "experience": {
    "items": [
      {
        "id": string (unique identifier),
        "title": string (job title),
        "position": string (same as title),
        "company": string (company name),
        "description": string (job description),
        "startDate": string (ISO date or YYYY-MM format),
        "endDate": string (ISO date or YYYY-MM format, empty if current),
        "stillEmployed": boolean (true if current job),
        "currentlyEmployed": boolean (same as stillEmployed),
        "duration": string (e.g., "2 years"),
        "location": string (optional, job location),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "education": {
    "items": [
      {
        "id": string (unique identifier),
        "institution": string (school/university name),
        "degree": string (degree type, e.g., "Bachelor's", "Master's"),
        "type": string (same as degree),
        "programName": string (field of study/major),
        "field": string (same as programName),
        "startDate": string (ISO date or YYYY-MM format),
        "endDate": string (ISO date or YYYY-MM format, empty if in progress),
        "duration": string (e.g., "4 years"),
        "inProgress": boolean,
        "currentlyEnrolled": boolean (same as inProgress),
        "awardEarned": boolean,
        "description": string (optional),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "skills": {
    "items": [
      {
        "id": string (unique identifier),
        "skills": string (skill name),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "projects": {
    "items": [
      {
        "id": string (unique identifier),
        "name": string (project name),
        "description": string (project description),
        "url": string (optional, project URL),
        "technologies": string[] (array of technology names),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "certifications": {
    "items": [
      {
        "id": string (unique identifier),
        "name": string (certification name),
        "issuer": string (issuing organization),
        "issueDate": string (ISO date or YYYY-MM format),
        "expiryDate": string (optional, ISO date or YYYY-MM format),
        "noExpiration": boolean,
        "url": string (optional, credential URL),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "awards": {
    "items": [
      {
        "id": string (unique identifier),
        "title": string (award title),
        "issuer": string (issuing organization),
        "date": string (ISO date or YYYY-MM format),
        "description": string (optional),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "publications": {
    "items": [
      {
        "id": string (unique identifier),
        "title": string (publication title),
        "type": string ("Journal" | "Conference" | "Book" | "Article" | "Patent" | "Other"),
        "publisher": string (publisher name),
        "publishedDate": string (ISO date or YYYY-MM format),
        "authors": string[] (array of author names),
        "url": string (optional, publication URL),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "professionalAffiliations": {
    "items": [
      {
        "id": string (unique identifier),
        "name": string (affiliation name),
        "organization": string (organization name),
        "role": string (role/title in organization),
        "startDate": string (ISO date or YYYY-MM format),
        "endDate": string (optional, ISO date or YYYY-MM format),
        "duration": string (optional),
        "activeAffiliation": boolean,
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "volunteerWork": {
    "items": [
      {
        "id": string (unique identifier),
        "organization": string (organization name),
        "role": string (volunteer role),
        "startDate": string (ISO date or YYYY-MM format),
        "endDate": string (optional, ISO date or YYYY-MM format),
        "duration": string (optional),
        "currentlyVolunteering": boolean,
        "description": string (optional),
        "location": string (optional),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "languages": {
    "items": [
      {
        "id": string (unique identifier),
        "name": string (language name),
        "proficiency": string ("Basic" | "Intermediate" | "Advanced" | "Native"),
        "verificationStatus": string (default: "unverified")
      }
    ]
  },
  "hobbiesAndInterests": string[] (array of hobby/interest strings),
  "testimonials": {
    "items": [] (usually empty for new resumes)
  }
}

Important Notes:
- All dates should be in ISO format (YYYY-MM-DD) or at least YYYY-MM format
- Generate unique IDs for all items using format: "type-timestamp-random" (e.g., "exp-1234567890-abc123")
- Set verificationStatus to "unverified" for all items by default
- If a field is not found in the PDF, use empty string or empty array as appropriate
- For boolean fields, default to false if not specified
- Extract as much information as possible, but don't invent information that's not in the PDF
- Handle multiple languages - extract information regardless of the language used in the PDF
`
