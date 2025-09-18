yaml
overview:
  objective: "Develop a Minimum Viable Product (MVP) of SoloAI, an AI-powered travel planner for solo travelers, leveraging Google's ecosystem for a robust, scalable, and intelligent solution."
  features:
    - "Personalized Itinerary Generation: Users input destination, dates, and interests to receive a custom travel plan."
    - "Interactive Map Integration: View itinerary locations, routes, and points of interest on a map."
    - "User Profile Management: Save user preferences and travel history."
    - "Data-Driven Insights: Collect anonymized usage data to improve recommendations."

steps:
  - name: "Phase 1: Project Initialization & Foundation"
    steps:
      - name: "1.1: Setup Firebase Project"
        tools_used: ["Firebase Console"]
        tool_roles:
          - "Firebase Console: Initialize Firestore, Authentication, Functions, and Hosting."
        required_input_output:
          input: "Project Name (SoloAI)"
          output: "Firebase project configuration keys and service account credentials."
        owner: "project_lead"
        dependencies: []
      - name: "1.2: Initialize Git Repository & Documentation"
        tools_used: ["Git", "Github Spec Kit"]
        tool_roles:
          - "Git: Version control."
          - "Github Spec Kit: Generate foundational documentation templates."
        required_input_output:
          input: "Project structure plan."
          output: "Initialized Git repo with SPECIFICATION.md, ARCHITECTURE.md, and this plan.yaml."
        owner: "dev_ops"
        dependencies: ["1.1"]

  - name: "Phase 2: Backend Development & AI Integration"
    steps:
      - name: "2.1: Develop User Authentication Service"
        tools_used: ["Firebase Authentication", "Firebase Functions"]
        tool_roles:
          - "Firebase Authentication: Handle user sign-up, login, and session management."
          - "Firebase Functions: Create backend triggers for new user creation (e.g., creating a user profile in Firestore)."
        required_input_output:
          input: "User credentials (email/password, OAuth)."
          output: "Authenticated user session (JWT), user record in Firebase Auth and Firestore."
        owner: "backend_dev"
        dependencies: ["1.1"]
      - name: "2.2: Core Itinerary Generation API"
        tools_used: ["Vertex AI (Gemini Pro)", "Firebase Functions", "Perplexity Pro (optional)"]
        tool_roles:
          - "Firebase Functions: Create an HTTP-triggered function to receive travel requests."
          - "Vertex AI (Gemini Pro): Generate itinerary content based on structured prompts."
          - "Perplexity Pro: (Optional) Enhance prompts with real-time, deep knowledge about destinations."
        required_input_output:
          input: "JSON payload: {destination: string, dates: [string], interests: [string]}"
          output: "JSON response: {itinerary: object}"
        owner: "backend_dev"
        dependencies: ["2.1"]
      - name: "2.3: Location Data Enrichment API"
        tools_used: ["Google Maps API", "Firebase Functions", "Windsurf Pro (optional)"]
        tool_roles:
          - "Google Maps API: Validate locations, fetch coordinates, find points of interest."
          - "Firebase Functions: Augment Gemini-generated itinerary with precise location data."
          - "Windsurf Pro: (Optional) Add real-time weather/contextual data to itinerary."
        required_input_output:
          input: "Generated itinerary with place names."
          output: "Enriched itinerary with coordinates, addresses, and other metadata."
        owner: "backend_dev"
        dependencies: ["2.2"]
      - name: "2.4: Data Logging Service"
        tools_used: ["BigQuery", "Firebase Functions"]
        tool_roles:
          - "Firebase Functions: Create an async function to log events."
          - "BigQuery: Store and analyze anonymized user interaction data."
        required_input_output:
          input: "Event payload: {userId: string, eventType: string, metadata: object}"
          output: "New row in BigQuery table."
        owner: "data_engineer"
        dependencies: ["1.1"]

  - name: "Phase 3: Frontend Development"
    steps:
      - name: "3.1: UI/UX Scaffolding"
        tools_used: ["React/Vue/Angular", "Firebase Hosting"]
        tool_roles:
          - "React/Vue/Angular: Build the single-page application structure."
          - "Firebase Hosting: Setup CI/CD for deploying the frontend."
        required_input_output:
          input: "UI mockups."
          output: "Component library and basic app shell."
        owner: "frontend_dev"
        dependencies: ["1.2"]
      - name: "3.2: Implement User Authentication Flow"
        tools_used: ["Firebase Auth SDK"]
        tool_roles:
          - "Firebase Auth SDK: Integrate login, signup, and logout functionality."
        required_input_output:
          input: "UI components for auth."
          output: "A stateful, authenticated frontend application."
        owner: "frontend_dev"
        dependencies: ["2.1", "3.1"]
      - name: "3.3: Build Itinerary Request & Display Interface"
        tools_used: ["Google Maps API (JS SDK)"]
        tool_roles:
          - "Google Maps API (JS SDK): Render maps, markers, and routes."
        required_input_output:
          input: "Backend API endpoints."
          output: "Interactive view for users to request and see their travel plans."
        owner: "frontend_dev"
        dependencies: ["2.3", "3.2"]

workflow:
  - "User Signup/Login:":
    - "1. User interacts with Frontend UI."
    - "2. Frontend calls Firebase Auth SDK."
    - "3. On success, Firebase Function trigger creates a user profile in Firestore."
  - "Itinerary Generation:":
    - "1. Authenticated user submits form (destination, dates, interests) on Frontend."
    - "2. Frontend calls 'generateItinerary' Firebase Function."
    - "3. Function builds a detailed prompt and calls Vertex AI (Gemini Pro)."
    - "4. Gemini Pro returns a structured itinerary draft."
    - "5. Function calls Google Maps API to enrich the draft with coordinates and place IDs."
    - "6. The final itinerary is saved to the user's profile in Firestore."
    - "7. The final itinerary is returned to the Frontend for display on a map."
  - "Analytics Event Logging:":
    - "1. User performs a key action (e.g., saves itinerary, clicks a place)."
    - "2. Frontend calls 'logEvent' Firebase Function with an anonymized payload."
    - "3. Function streams the data into the appropriate BigQuery table."

artifacts:
  - name: "Project Plan"
    location: "/plan.yaml"
    description: "This machine-executable plan."
  - name: "System Specification"
    location: "/docs/SPECIFICATION.md"
    description: "Detailed system spec generated via Github Spec Kit."
  - name: "Architecture Diagram"
    location: "/docs/ARCHITECTURE.md"
    description: "High-level system architecture."
  - name: "API Definitions"
    location: "/specs/openapi.yaml"
    description: "OpenAPI specification for backend functions."
  - name: "Backend Code"
    location: "/functions/src/"
    description: "Source code for all Firebase Functions."
  - name: "Frontend Code"
    location: "/app/src/"
    description: "Source code for the web application."

api_integrations:
  - service: "Vertex AI (Gemini Pro)"
    provides: "Natural language processing, text generation."
    access: "Accessed via Google Cloud SDK from backend (Firebase Functions). Requires IAM authentication."
  - service: "Google Maps API"
    provides: "Geocoding, Places data, Directions, Map rendering."
    access: "Accessed via REST API from backend (for data enrichment) and JavaScript SDK from frontend (for rendering)."
  - service: "Firebase Authentication"
    provides: "User session management, authentication services."
    access: "Accessed via client-side SDKs (Web, iOS, Android)."
  - service: "Firebase Firestore"
    provides: "NoSQL document database for storing user profiles and itineraries."
    access: "Accessed via client-side and admin SDKs, protected by Security Rules."
  - service: "BigQuery"
    provides: "Data warehousing and analytics."
    access: "Accessed via Google Cloud SDK from backend for streaming data."

data_storage:
  - store: "Firebase Firestore"
    data: "User profiles (email, UID, preferences), user-generated itineraries (text, locations, dates)."
    access_control: "Firebase Security Rules restrict data access to the authenticated owner of the data."
  - store: "BigQuery"
    data: "Anonymized event logs (UI interactions, API calls, feature usage), performance metrics."
    access_control: "Access controlled by Google Cloud IAM roles. Backend services have 'BigQuery Data Editor' role."

deployment_testing:
  - phase: "Local Development"
    strategy: "Use Firebase Emulator Suite to run local instances of Functions, Firestore, and Auth. APIs for Google Maps and Vertex AI will be mocked to avoid costs and dependencies."
  - phase: "Staging/Integration Testing"
    strategy: "Deploy to a separate Firebase project ('SoloAI-staging'). Run automated end-to-end tests (e.g., using Cypress) that hit live, sandboxed APIs."
  - phase: "Production Deployment"
    strategy: "CI/CD pipeline (e.g., GitHub Actions) deploys frontend to Firebase Hosting and backend to Firebase Functions on merge to 'main' branch."

compliance_risks:
  - risk: "PII Storage"
    description: "User data (email, name, preferences) is stored."
    mitigation: "All data is stored in Firebase, which is compliant with major privacy regulations. Firestore Security Rules ensure a user can only access their own data. All data transfer is over HTTPS."
  - risk: "Location & Travel Data Sensitivity"
    description: "Users' travel plans are highly sensitive."
    mitigation: "Same as PII storage. Data is not shared or sold. Anonymized data in BigQuery will not contain specific user itineraries, only aggregate trends."
  - risk: "AI Safety & Recommendations"
    description: "AI may recommend unsafe locations or activities."
    mitigation: "Prompts for Gemini Pro will be engineered to prioritize safety and well-regarded locations. A clear disclaimer will be displayed in the UI stating that AI-generated content may be inaccurate and should be verified."

success_criteria:
  - name: "End-to-End User Flow Verification"
    description: "A test user can successfully complete the entire workflow: sign up, log in, submit a request for a 3-day trip to Paris with 'history and cafes' as interests, receive a valid and coherent itinerary, and view it on a map."
  - name: "Performance Metrics"
    description: "P95 for itinerary generation (user submit to UI display) should be under 15 seconds."
  - name: "Data Integrity"
    description: "After the E2E test, verify that the user's account exists in Firebase Auth, the itinerary is correctly stored in their Firestore document, and an anonymized 'itinerary_created' event is present in BigQuery."

amendment_log:
  - version: 1.0
    date: "2025-09-18"
    author: "Gemini-CLI"
    change: "Initial creation of the project plan."
