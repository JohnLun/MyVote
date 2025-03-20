# Deploying React + ASP.NET Application on Azure App Service

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

