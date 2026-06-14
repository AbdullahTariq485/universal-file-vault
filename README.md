Important Note:

apk link: https://expo.dev/accounts/abdullah485/projects/universalfilevault/builds/4b715af1-e3ca-405f-b7ce-21d5853b1c73
(App is still in development stages so some feature may show errors.Can be just early accessed for now.)

Demo Profile:

Email: i@gmail.com

Password: ik1994

Make sure to login using these credentials in case of not being signed up due to rate limits in supabase.

🗂️ Project Report:

1. Project Idea
   
A secure, cross-platform cloud storage application built with React Native (Expo) and Supabase. It provides users with a private, high-performance vault to upload, track, and manage documents across iOS, Android, and web engines from a single codebase.

2. Main Features

Instant Auth:
Secure login and registration with validation checks.
Smart Uploads: Streamlined system file picker with instant cloud syncing.
Auto-Theme: Unified support for system-wide light and high-contrast dark modes.
Alert System: Real-time context notifications for file uploads and status changes.

3. Database & Functionality
   
Powered by Supabase (PostgreSQL) to deliver secure data management:

Relational Storage: Links account metadata (user_preferences) and file data (user_documents) directly to the user's account identifier.
Row-Level Security (RLS): Database-level rules that lock records so users can only view or modify their own data.
Secure Storage Buckets: Stores raw file binaries inside an isolated storage partition (vault-files).
Automated Triggers: Tracks file updates and refreshes system logs automatically.



4. Unique Feature
   
Zero-Config Connection Pipeline
The app uses a custom memory singleton loop tied to the runtime engine (globalThis). This configuration automatically detects whether the app is running on a web browser, a native mobile phone, or a server environment. It adjusts storage configurations on the fly to eliminate duplicate network connections and ensure fast, secure file transfers without requiring external config files.




