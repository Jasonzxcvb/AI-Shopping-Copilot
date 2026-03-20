# project-assignment-4-group-28

## Install

```powershell
npm install
```

## Current Baseline Status

- Frontend can start locally on `http://localhost:3000`
- Backend can start locally on `http://localhost:5000`
- Current baseline keeps the original project behavior unchanged
- Full frontend-backend-database verification is currently blocked only by local MongoDB not running
- Default MongoDB connection string is `mongodb://localhost:27017/ComputerStore`
- Sample data is stored in `database.txt` and must be imported manually before full verification
- This repository state is intended to be the pre-AI baseline for future comparison

## Start Frontend

```powershell
npm run start:frontend
```

Default URL: `http://localhost:3000`

## Start Backend

```powershell
npm run start:backend
```

Default API URL: `http://localhost:5000`

## Database

The backend uses MongoDB.

Default connection:

```text
mongodb://localhost:27017/ComputerStore
```

Optional environment variables:

```text
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ComputerStore
```

Sample product data is included in [database.txt](./database.txt).

## Local MongoDB Import

Start your local MongoDB service first, then import the sample products into the `ComputerStore` database.

If you have MongoDB Database Tools installed, the simplest approach is:

```powershell
mongoimport --uri "mongodb://localhost:27017/ComputerStore" --collection products --file .\database.txt
```

If you later convert the file to a JSON array, use:

```powershell
mongoimport --uri "mongodb://localhost:27017/ComputerStore" --collection products --file .\database.txt --jsonArray
```

After import, start the backend:

```powershell
npm run start:backend
```
