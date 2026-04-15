## ADDED Requirements

### Requirement: User can save Google Drive upload settings
The system SHALL provide an admin settings flow that allows the user to save Google Drive upload configuration, including a service account credential JSON payload and a target Google Drive folder ID.

#### Scenario: Save valid Google Drive settings
- **WHEN** the user submits a valid service account JSON and a non-empty folder ID
- **THEN** the system stores the settings on the server
- **THEN** the system returns a success response without exposing the full credential payload back to the browser

#### Scenario: Reject invalid settings payload
- **WHEN** the user submits malformed JSON, missing required service account fields, or an empty folder ID
- **THEN** the system rejects the request with a validation error

### Requirement: User can verify Google Drive connectivity
The system SHALL provide a connection test that validates the stored Google Drive settings against the configured target folder before uploads are attempted.

#### Scenario: Connection test succeeds
- **WHEN** valid stored credentials have access to the configured folder
- **THEN** the system reports the connection as successful

#### Scenario: Connection test fails
- **WHEN** credentials are invalid or the target folder is not writable by the configured service account
- **THEN** the system reports a failure with a human-readable error message
