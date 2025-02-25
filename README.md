# Activity Tracker for Visual Studio Code

A VS Code extension to track activity and time spent on each language by the user. This activity is then logged into the user's GitHub repository, organized by year, month, date, and time.

[![GitHub](https://img.shields.io/github/followers/fahadnawaz01?style=social)](https://github.com/fahadnawaz01/VSCode_TrackingActivityExtension)

## Installation

To use the Time Tracker extension, you'll need to configure it with your GitHub credentials. You will also need to create a dedicated repository for the logs.

1.  **Create a GitHub Repository for Logs:**

    - Go to your GitHub account and create a new repository. This repository will store the activity logs. You can name it something like `time-tracker-logs` or similar. The repository can be either **public** or **private**, depending on your preference.

2.  **Open VS Code Settings:**

    - Go to **File > Preferences > Settings** (or **Code > Preferences > Settings** on macOS).
    - Alternatively, use the keyboard shortcut **Ctrl + ,** (or **Cmd + ,** on macOS).

3.  **Locate Time Tracker Settings:**

    - In the Settings editor, type "timeTracker" in the search bar.
    - This will filter the settings to show only those related to the Time Tracker extension.

4.  **Populate the Values:**

    - You'll see three settings:
      - **timeTracker.gitUsername:** Enter your GitHub username.
      - **timeTracker.repo:** Enter the name of the repository you created in step 1 (e.g., `time-tracker-logs`).
      - **timeTracker.gitHubToken:** Enter your GitHub Personal Access Token (see instructions below on how to generate one).

![Screenshot of configuration settings](/Screenshots/Configuration%20Values.png)

5.  **Generating a GitHub Personal Access Token:**

    - Go to your GitHub account settings (**Settings > Developer settings > Personal access tokens > Token(Classic)**).
    - Click on **Generate new token**.
    - Give your token a descriptive name (e.g., "Time Tracker Extension").
    - Select the **repo** scope (this gives the extension access to your repositories). If you are using a _private_ log repository, you will need to grant the appropriate permissions for private repo access. For a _public_ repository, the base `repo` scope is sufficient.
    - Click **Generate token**.
    - **Important:** Copy the token immediately as it will only be shown once.

6.  **Save Settings:**

    - VS Code settings are saved automatically as you make changes.

**Important Notes:**

- The **timeTracker.gitHubToken** is sensitive information. Keep it secure and do not share it.
- The **repo** scope is generally sufficient. If using a private repo, ensure your token has the necessary permissions.
- The repository specified in `timeTracker.repo` _must exist_ before the extension can start logging data.
- If you encounter any issues, refer to the extension's documentation or contact the developer for assistance.

By following these steps, you can successfully configure the Time Tracker extension and start tracking your time spent on different programming languages. The logs will be saved to the GitHub repository you designated.

**Usage:**

After setting up the extension, your activity is logged every half hour and pushed to the GitHub repository you specified.

## To view a graph of your activity:

1.  Open the command palette (**Ctrl+Shift+P** or **Cmd+Shift+P**).
2.  Type "Show Graph" and select the command.

This will open a webview within VS Code displaying a graph of your activity. You can choose to view the data by year or month using the dropdown menus provided.

![Screenshot of configuration settings](/Screenshots/graph.gif)

**Disclaimer:**

```
This extension is open-source, and its code is available on [GitHub](<YOUR_GITHUB_REPO_LINK>).While this extension requires access to your GitHub repository for logging purposes, user data privacy is of utmost importance.  The extension only utilizes the granted permissions (specifically the `repo` scope) to write log files to the designated repository.  No other data is accessed, collected, or transmitted by the extension.  The extension adheres to best practices for secure data handling and storage, but users are ultimately responsible for the security of their GitHub credentials and the chosen repository's visibility settings (public or private).
```
