# Work Tracking Management System 📋

A modern, real-time, spreadsheet-inspired web application for managing and tracking work items. Built with React, TypeScript, Firebase, and Tailwind CSS.

![App Screenshot](https://storage.googleapis.com/aistudio-hosting/workspace-llm-15520.web.app/media/d9341499-5288-4672-ad18-c2b4e857995e.png)

## ✨ Key Features

- **Real-Time Database**: All data is synchronized in real-time across all clients using Google Firestore.
- **CRUD Operations**: Easily **C**reate, **R**ead, **U**pdate, and **D**elete work items through an intuitive modal form.
- **Advanced Filtering & Sorting**:
    - Filter items by status using color-coded tabs (`UNDER PROCESSING`, `Approved`, `Rejected`, etc.).
    - Instantly search across multiple fields (Customer Name, Tracking Number, etc.).
    - Sort the data by any column in ascending or descending order.
- **Bulk Actions**:
    - **Selection Mode**: Select multiple items to perform actions in bulk.
    - **Bulk Edit**: Update the status or "Work By" field for multiple items at once.
    - **Bulk Delete**: Safely delete multiple items with a confirmation prompt.
    - **Bulk Print**: Generate a clean, print-friendly report of selected items.
- **Data Management**:
    - **Archive System**: De-clutter your main view by archiving completed or rejected items.
    - **Data Import**: Easily import data from a tab-separated value (TSV) file, perfect for migrating from Excel.
- **Enhanced UX & Accessibility**:
    - **Light & Dark Mode**: Switch between themes to suit your preference.
    - **Font Size Adjuster**: Increase, decrease, or reset the font size for better readability.
    - **Edit Lock**: Toggle "Edit Mode" to prevent accidental modifications to your data.
    - **Responsive Design**: A seamless experience on desktops, tablets, and mobile devices.
- **Quick Actions**:
    - Copy tracking numbers to the clipboard with one click.
    - Open external tracking links directly from the table.
    - Generate pre-filled WhatsApp messages to customers.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Google Firebase (Firestore)](https://firebase.google.com/)
- **Icons**: Custom SVG components

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites

You need to have a Google Firebase account.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/work-tracking-system.git
cd work-tracking-system
```

### 2. Set up Firebase

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Add a new "Web" app to your project.
3.  During the setup, Firebase will provide you with a `firebaseConfig` object. Copy this object.
4.  Open the `firebase.ts` file in the project.
5.  Replace the existing `firebaseConfig` object with the one you copied from your Firebase project.
6.  In your Firebase project settings, go to the "Firestore Database" section and create a new database. Start in **test mode** for easy setup (you can configure security rules later).
7.  Create a collection named `work-items` to store your data.
8.  (Optional) Create a collection named `options` with a document `appData` to dynamically manage dropdown options for `workTypes`, `statuses`, and `workBy`.

### 3. Run the Application

Since this project uses modern browser features like import maps, there's no complex build step required.

-   You can use a simple local server like `http-server` or Python's built-in server.
    ```bash
    # Using Python 3
    python -m http.server
    ```
-   Or, simply open the `index.html` file directly in your web browser.

## 📂 File Structure

```
.
├── index.html              # Main HTML entry point
├── index.tsx               # React root renderer
├── App.tsx                 # Main application component (state, logic, layout)
├── components/             # Reusable React components
│   ├── WorkItemRow.tsx     # Renders a single row in the table
│   ├── WorkItemForm.tsx    # Add/Edit item modal form
│   ├── HeaderActions.tsx   # Settings and actions dropdown
│   └── ...                 # Other UI components
├── firebase.ts             # Firebase configuration and initialization
├── types.ts                # TypeScript type definitions (e.g., WorkItem)
├── constants.ts            # Application-wide constants
└── metadata.json           # Application metadata
```

## 📄 License

This project is licensed under the MIT License.
