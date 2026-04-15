## ADDED Requirements

### Requirement: User can save Google Drive upload settings
The system SHALL provide an admin settings flow that allows the user to save Google Drive upload configuration, including an OAuth Web Client JSON payload and a target Google Drive folder ID.

#### Scenario: Save valid Google Drive settings
- **WHEN** the user submits a valid OAuth Web Client JSON and a non-empty folder ID
- **THEN** the system stores the settings on the server
- **THEN** the system returns a success response without exposing the full client secret payload back to the browser

#### Scenario: Reject invalid settings payload
- **WHEN** the user submits malformed JSON, missing required OAuth client fields, or an empty folder ID
- **THEN** the system rejects the request with a validation error

### Requirement: User can complete OAuth authorization for Google Drive
The system SHALL provide a browser-based OAuth authorization flow that exchanges the Google callback code for persistent tokens stored on the server.

#### Scenario: OAuth callback succeeds
- **WHEN** the user opens the generated authorization URL and completes Google consent successfully
- **THEN** the system stores the returned refresh token on the server
- **THEN** the settings status reports that Google Drive has been authorized

### Requirement: User can verify Google Drive connectivity
The system SHALL provide a connection test that validates the stored Google Drive settings against the configured target folder before uploads are attempted.

#### Scenario: Connection test succeeds
- **WHEN** valid stored OAuth tokens have access to the configured folder
- **THEN** the system reports the connection as successful

#### Scenario: Connection test fails
- **WHEN** tokens are missing, revoked, or the target folder is not writable by the authorized Google account
- **THEN** the system reports a failure with a human-readable error message
