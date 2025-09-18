markdown
# Task Breakdown: Personalized Itinerary Generation

## Phase 1: Project Setup & Configuration

- **Task:** 1.1 Setup Google Cloud Project and Enable APIs
  - **Description:** Create a new Google Cloud Project. Enable required APIs: Vertex AI (for Gemini), Google Maps Platform (Places API, Directions API, Maps SDK), and Firebase.
  - **Owner:** Solo Dev
  - **Dependencies:** Google Cloud Account
  - **Linked Spec:** `story_ITINERARY-GENERATOR.md`
  - **Acceptance Criteria:** All specified APIs are enabled and linked to the project's billing account.

- **Task:** 1.2 Initialize Firebase Project
  - **Description:** Set up a new Firebase project, linking it to the Google Cloud Project. Configure Firestore Database and Firebase Authentication.
  - **Owner:** Solo Dev
  - **Dependencies:** Task 1.1
  - **Linked Spec:** `story_ITINERARY-GENERATOR.md`
  - **Acceptance Criteria:** Firebase project is created. Firestore is provisioned in a specific region. Basic authentication methods (e.g., Email/Password) are enabled.

- **Task:** 1.3 Define Data Models for User Preferences and Itineraries
  - **Description:** Design and document the Firestore data structures for storing user travel preferences (e.g., interests, budget, pace) and the generated itineraries (e.g., daily schedule, locations, routes).
  - **Owner:** Solo Dev
  - **Dependencies:** -
  - **Linked Spec:** `TODO: spec_DATA-MODELS.md`
  - **Acceptance Criteria:** Clear, documented schemas for `user_preferences` and `itineraries` collections are finalized.

## Phase 2: Backend Development & API Integration

- **Task:** 2.1 Develop User Preference Input API Endpoint
  - **Description:** Create a secure API endpoint (e.g., Firebase Cloud Function) to receive and store user travel preferences in Firestore.
  - **Owner:** Solo Dev
  - **Dependencies:** Task 1.3
  - **Linked Spec:** `story_ITINERARY-GENERATOR.md`
  - **Acceptance Criteria:** Endpoint successfully validates and saves user preference data to the correct Firestore document.

- **Task:** 2.2 Core Itinerary Generation Logic with Gemini
  - **Description:** Create a backend service (Firebase Cloud Function) that takes user preferences, constructs a detailed prompt, and calls the Gemini API to generate a structured itinerary plan (as JSON).
  - **Owner:** Solo Dev
  - **Dependencies:** Task 1.1, Task 2.1, Vertex AI SDK
  - **Linked Spec:** `story_ITINERARY-GENERATOR.md`
  - **Acceptance Criteria:** Service can successfully call the Gemini API and receive a logically structured, JSON-formatted travel plan based on input preferences.

- **Task:** 2.3 Enhance Itinerary with Google Maps Data
  - **Description:** Augment the Gemini-generated itinerary by calling the Google Maps Places API to fetch details for each location (e.g., exact coordinates, ratings, photos, opening hours).
  - **Owner:** Solo Dev
  - **Dependencies:** Task 2.2, Google Maps Places API
  - **Linked Spec:** `story_ITINERARY-GENERATOR.md`
  - **Acceptance Criteria:** Location data in the itinerary is enriched with real-time, accurate information from the Maps API.

- **Task:** 2.4 Save Generated Itinerary to Firestore
  - **Description:** Develop the logic to store the final, enriched itinerary back into the user's profile in Firestore.
  - **Owner:** Solo Dev
  - **Dependencies:** Task 1.3, Task 2.3
  - **Linked Spec:** `story_ITINERARY-GENERATOR.md`
  - **Acceptance Criteria:** The complete itinerary is successfully saved to the `itineraries` collection in Firestore, linked to the user ID.

## Phase 3: Frontend Development

- **Task:** 3.1 Build User Preference Input Form
  - **Description:** Create the UI component for users to input their travel preferences (destination, dates, interests, budget, etc.).
  - **Owner:** Solo Dev
  - **Dependencies:** Task 1.3 (Data Models)
  - **Linked Spec:** `TODO: spec_UI-UX.md`
  - **Acceptance Criteria:** The form correctly captures all required preference fields and sends the data to the backend upon submission.

- **Task:** 3.2 Develop Itinerary Display Component
  - **Description:** Create the UI to display the generated itinerary in a user-friendly format, such as a timeline or a daily schedule view with map integration.
  - **Owner:** Solo Dev
  - **Dependencies:** Task 1.3 (Data Models), Google Maps SDK
  - **Linked Spec:** `TODO: spec_UI-UX.md`
  - **Acceptance Criteria:** The component can render a complete itinerary from Firestore, showing locations, schedules, and routes on an embedded map.

## Phase 4: Integration, Testing & Data Logging

- **Task:** 4.1 End-to-End Integration
  - **Description:** Connect the frontend components (3.1, 3.2) with the backend services (2.1, 2.2) to create a seamless user flow from preference input to itinerary display.
  - **Owner:** Solo Dev
  - **Dependencies:** All Phase 2 and Phase 3 tasks
  - **Linked Spec:** `story_ITINERARY-GENERATOR.md`
  - **Acceptance Criteria:** A user can fill out the preference form, trigger the generation process, and see the final itinerary displayed without errors.

- **Task:** 4.2 Implement Itinerary Logging to BigQuery
  - **Description:** Set up a data pipeline (e.g., using Firebase Extensions or Cloud Functions) to log key details of every generated itinerary (e.g., destination, duration, user interests) to a BigQuery table for analysis.
  - **Owner:** Solo Dev
  - **Dependencies:** Task 1.1, Task 2.4, BigQuery API
  - **Linked Spec:** `TODO: spec_ANALYTICS.md`
  - **Acceptance Criteria:** A new record is successfully created in the designated BigQuery table each time an itinerary is saved to Firestore.

- **Task:** 4.3 Unit & Integration Testing
  - **Description:** Write and execute unit tests for backend logic (especially API integrations) and integration tests for the complete user flow.
  - **Owner:** Solo Dev
  - **Dependencies:** Task 4.1
  - **Linked Spec:** `story_ITINERARY-GENERATOR.md`
  - **Acceptance Criteria:** Core functions are covered by unit tests. The end-to-end generation flow passes all integration tests.
