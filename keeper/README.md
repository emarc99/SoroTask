# SoroTask Keeper Configuration Guide

Welcome to the SoroTask Keeper network! This guide provides step-by-step instructions on how to set up and run a SoroTask Keeper bot. By running a keeper, you help ensure tasks in the SoroTask network are executed reliably and on time.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://npmjs.com/) 

## Environment Variables

The keeper bot requires certain configuration details to interact with the Stellar/Soroban network. 
Create a `.env` file in the `keeper` directory and configure the following variables:

```env
# The URL of the Soroban RPC server you are connecting to
SOROBAN_RPC_URL="https://rpc-futurenet.stellar.org"

# The network passphrase for the network you are targeting
NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"

# The secret key of the keeper account that will submit the transactions
KEEPER_SECRET="S..."
```

### Explanation of Variables:
- **`SOROBAN_RPC_URL`**: This is the endpoint the bot uses to communicate with the network. You can use public nodes provided by Stellar or set up your own. 
- **`NETWORK_PASSPHRASE`**: This ensures your bot is talking to the right network (e.g., Futurenet, Testnet, or Public Network).
- **`KEEPER_SECRET`**: Your keeper wallet's secret key. *Keep this private and never commit it to version control (we've ensured `.env` is ignored by git).*

## Setup Instructions

Once you have your prerequisite software and environment variables ready, follow these steps on a clean environment:

1. **Navigate to the Keeper Directory**  
   Open your terminal and navigate to the `keeper` folder if you haven't already:
   ```bash
   cd keeper
   ```

2. **Install Dependencies**  
   Run the following command to install the required Node.js packages (`soroban-client` and `dotenv`):
   ```bash
   npm install
   ```

3. **Run the Keeper Bot**  
   Start the Node.js application to begin listening for and executing SoroTask tasks:
   ```bash
   node index.js
   ```

If successful, you will see output indicating that the Keeper has started, along with logs of its periodic checks for due tasks!

## Troubleshooting

### Issue: "Account not found"
- **Cause**: The account associated with your `KEEPER_SECRET` does not exist on the network you are trying to use.
- **Solution**: Fund your keeper account. If you are on Testnet or Futurenet, use the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator) to fund the public key associated with your secret. Ensure you've set the correct `NETWORK_PASSPHRASE` and match the network on Stellar Laboratory.

### Issue: "RPC error" or "Could not connect to server"
- **Cause**: The bot cannot reach the specified RPC endpoint, or the endpoint rejected the request due to rate-limiting or an invalid URL setup.
- **Solution**: 
  - Double-check your `SOROBAN_RPC_URL` in the `.env` file for any typos. Ensure it includes the proper protocol (e.g., `https://`).
  - If you're using a public RPC, you might be rate-limited. Wait a few moments and try again, or switch to a dedicated/private RPC provider node.

### Issue: `Error: Cannot find module 'dotenv'` or `Error: Cannot find module 'soroban-client'`
- **Cause**: Application dependencies were not correctly or fully installed.
- **Solution**: Ensure you ran `npm install` inside the `keeper/` directory correctly. Try clearing cache or removing `node_modules` (`rm -rf node_modules`) and running `npm install` again.

## Need Help?
If you're still running into issues, feel free to open a GitHub issue or reach out to our community channels.
