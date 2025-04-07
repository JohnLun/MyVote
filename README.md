# 🗳️ MyVote

Developed by Jonathan Lun, Mahlon Reese, and Melanie Ehrlich

## 📄 Overview

**MyVote** is a secure, full-stack web application designed to simplify and modernize the poll process.

---

## 🏆 Features

- **User-Friendly Voting Interface**: Clean, responsive UI for voting easily on desktop or mobile.
- **Real-Time Results**: Live updates as votes are submitted, powered by SignalR.
- **PDF Results Generation**: Auto-generate voter participation results.
- **Admin Dashboard**: Manage polls, and monitor vote counts.
- **QR Code Sharing**: Share polls easily with QR codes.
- **Interactive Charts**: Visualize poll outcomes with dynamic graphs.

---

## 💻 Tech Stack

- **Frontend**: React.js, Vite, Material UI (MUI)
- **Backend**: ASP.NET Core (.NET 8)
- **Database**: Entity Framework Core with SQL Server / PostgreSQL
- **Real-Time Communication**: SignalR
- **PDF & Canvas Tools**: jsPDF, html2canvas
- **Visualization**: Chart.js, D3

---

## 📦 Dependencies

### Frontend (`myvote.client`)
- `react`
- `react-dom`
- `react-router-dom`
- `@mui/material`
- `@emotion/react`, `@emotion/styled`
- `@microsoft/signalr`
- `framer-motion`
- `chart.js`, `d3`
- `jspdf`, `html2canvas`
- `qrcode.react`, `react-qr-code`
- `react-icons`
- `react-toastify`
- `react-useanimations`
- `@uidotdev/usehooks`
- `@react-pdf/renderer`

### Dev Tools
- `vite`
- `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`
- `@testing-library/*`, `vitest`, `msw`

### Backend (`MyVote.Server`)
- `Microsoft.AspNetCore.Cors`
- `Microsoft.AspNetCore.SignalR`
- `Microsoft.AspNetCore.SpaProxy`
- `Microsoft.Azure.SignalR`
- `Microsoft.EntityFrameworkCore` (Core, SQLServer, Tools, Design)
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `Swashbuckle.AspNetCore`


---


# 🔗 Deploying React + ASP.NET Application on Azure App Service

For full deployment instructions to Azure App Service, see below 👇

---

## Organizing Resources
1. Create a **resource group** following your naming convention.
   - Example: `rg-{app name}`.

## Deploying Web Application
1. Create an **Azure App Service** resource.
2. Link your **GitHub repository**.
   - The repository should include both **client** and **server** files.
3. Choose the branch to deploy from (typically `main`).
4. Create a **YAML workflow file** for automated deployment.

## Setting Up Workflow File
1. Adjust the auto-generated workflow file to:
   - Install Node.js.
   - Run `npm install` and any other necessary commands for the client.
   - Build the React application (`npm run build`).
2. Configure the backend deployment:
   - Install .NET dependencies.
   - Run necessary build and publish commands for the backend.
3. Help:
   - Check our workflow file for help

## Connecting Backend to Database
1. Create an **Azure SQL Server** and **Database**.
2. Use **SQL Authentication**.
3. Retrieve the **connection string** and add it to `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "your-connection-string-here"
     }
   }
   ```

## Verifying Deployment
- Visit **https://your-react-app.azurewebsites.net** to verify the frontend.
- Check **https://your-aspnet-app.azurewebsites.net/api/health** to verify the backend.

## Troubleshooting
- Check logs using:
  ```sh
  az webapp log tail --name YourApp --resource-group YourResourceGroup
  ```
- Ensure the correct API URL is set in the frontend environment variables.

---
Your React + ASP.NET application is now successfully deployed on Azure! 🚀

