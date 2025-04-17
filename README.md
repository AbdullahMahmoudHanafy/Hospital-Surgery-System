# Hospital-Surgery-System

The Hospital Surgery System is a comprehensive web application designed to manage various aspects of hospital operations. This system facilitates the tracking of device information, patient records, surgeon details, operating room status, and appointment scheduling. Additionally, it provides a dashboard for statistical insights and supports user management with secure access.

## Table of Contents
- [Demo](#demo)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Contributors](#contributors)


## Demo
https://github.com/user-attachments/assets/b5363139-66f6-45da-baa1-c08e30f7abc5


## Prerequisites

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

## Installation

### Project Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AbdullahMahmoudHanafy/Hospital-Surgery-System.git
   ``````
2. **Navigate into the project directory:**  

    ```bash
    cd Hospital-Surgery-System
    ``````

3. **Install dependencies:**  


    ```bash
    npm install
    ``````

### Database Setup

1. **Create your Database**


2. **Load The Schema**  

    using Edit [`schema.sql`](sql/schema.sql)


3. **Update the database configuration:**  

   Edit [`database.js`](database.js) and replace the default credentials with your own PostgreSQL setup:
   ```js
   const pool = new Pool({
     user: 'your_username',
     host: 'localhost',
     database: 'surgery',
     password: 'your_password',
     port: <your_postgres_port>,
   });
   ``````

## Usage

1. **Run the server:**  

    By default, the server runs on port 3000. You can start it with:

    ```bash
    node server.js
    ``````

2. **Access the application:**  
    Open your browser and navigate to http://localhost:3000 to view the application.

## Features

- **Device Management**: Track device details including warranty, status, price, and maintenance schedules.
- **Patient Records**: Store detailed patient information such as medications, health conditions, operation history, diseases, allergies, age, and gender.
- **Surgeon Information**: Manage surgeon profiles including certifications, qualifications, IDs, and specialization.
- **Operating Rooms**: Monitor operating room status, available devices, and general information about the rooms.
- **Appointment and Surgery Scheduling**: Organize and book appointments and surgeries with detailed information about dates, patients, and staff.
- **Dashboard and Statistics**: View statistical insights on patients, doctors, and devices.
- **User Management**: Allow admins and receptionists to create admin accounts and manage access through secure login and session management.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js, EJS (Embedded JavaScript templates)
- **Database**: PostgreSQL

## Contributors
- **AhmedAmgadElsharkawy**: [GitHub Profile](https://github.com/AhmedAmgadElsharkawy)
- **AbdullahMahmoudHanafy**: [GitHub Profile](https://github.com/AbdullahMahmoudHanafy)
- **malak-emad**: [GitHub Profile](https://github.com/malak-emad)
- **MohamadAhmedAli**: [GitHub Profile](https://github.com/MohamadAhmedAli)
- **RashedMamdouh2**: [GitHub Profile](https://github.com/RashedMamdouh2)
