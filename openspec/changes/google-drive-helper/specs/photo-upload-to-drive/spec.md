## ADDED Requirements

### Requirement: User can upload photos to the configured Google Drive folder
The system SHALL allow the user to select one or more image files in the web interface and upload them to the configured Google Drive folder through the backend service.

#### Scenario: Upload multiple photos successfully
- **WHEN** the user selects multiple valid image files and starts the upload
- **THEN** the system uploads each file to the configured Google Drive folder
- **THEN** the system returns per-file success results including the stored Google Drive file identifier

#### Scenario: Reject unsupported file types
- **WHEN** the user attempts to upload a file that is not an allowed image type
- **THEN** the system rejects that file and reports the reason without uploading it

### Requirement: User can see upload progress and results
The system SHALL show upload progress while files are being sent and SHALL show a final result summary indicating which files succeeded or failed.

#### Scenario: Browser shows in-progress state
- **WHEN** an upload is in progress
- **THEN** the interface displays an active uploading state and progress indicator

#### Scenario: Browser shows mixed upload results
- **WHEN** some files upload successfully and others fail
- **THEN** the interface displays separate success and failure outcomes for each file
