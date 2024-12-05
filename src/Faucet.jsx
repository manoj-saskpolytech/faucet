import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Container, TextField, Button, Typography, Card, CardContent, CircularProgress } from "@mui/material";

const CONTRACT_ADDRESS = "DEPLOYED_CONTRACT_ADDRESS"; //Replace with deployed contract address
const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FundsDispensed",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "lastRequestTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "requestFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

function FaucetApp() {
  const [userAddress, setUserAddress] = useState("");
  const [message, setMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [faucetBalance, setFaucetBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const provider = new ethers.providers.JsonRpcProvider("ALCHEMY_API"); // Replace with your Alchemy API URL
  const wallet = new ethers.Wallet("PRIVATE_KEY", provider); //Replace with the Private Key used to deploy the smart contract
  const faucetContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  useEffect(() => {
    // Fetch the faucet balance on component mount
    const fetchFaucetBalance = async () => {
      try {
        const balance = await provider.getBalance(CONTRACT_ADDRESS);
        setFaucetBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error fetching faucet balance:", error);
      }
    };

    fetchFaucetBalance();
  }, []);

  const handleAddressChange = (event) => {
    setUserAddress(event.target.value);
  };

  const handleRequestFunds = async (event) => {
    event.preventDefault();

    // Validate the Ethereum address
    if (!ethers.utils.isAddress(userAddress)) {
      setMessage("Invalid Ethereum address. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Processing your request...");

      // Call the `requestFunds` function
      const transaction = await faucetContract.requestFunds();
      await transaction.wait();

      // Update the faucet balance after successful transaction
      const balance = await provider.getBalance(CONTRACT_ADDRESS);
      setFaucetBalance(ethers.utils.formatEther(balance));

      setTransactionHash(transaction.hash);
      setMessage("Transaction successful! Check your wallet for 0.1 ETH.");
    } catch (error) {
      console.error("Error while processing the request:", error);
      if (error.data && error.data.message) {
        const revertReason = error.data.message.split("revert ")[1];
        setMessage(`Error: ${revertReason || "Transaction reverted."}`);
      } else {
        setMessage("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Card style={{ padding: "1.5rem", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center" style={{ fontWeight: "bold" }}>
            Ethereum Faucet
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Enter your Ethereum address to receive 0.1 ETH from the faucet.
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
            Faucet Balance: {faucetBalance !== null ? `${faucetBalance} ETH` : <CircularProgress size={16} />}
          </Typography>
          <form onSubmit={handleRequestFunds}>
            <TextField
              fullWidth
              label="Ethereum Address"
              variant="outlined"
              value={userAddress}
              onChange={handleAddressChange}
              style={{ marginBottom: "1rem" }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              style={{ marginBottom: "1rem", padding: "0.8rem" }}
            >
              {loading ? "Processing..." : "Request Funds"}
            </Button>
          </form>
          {message && (
            <Typography variant="body2" align="center" color="primary" gutterBottom>
              {message}
            </Typography>
          )}
          {transactionHash && (
            <Typography variant="body2" align="center">
              Transaction Hash:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007bff" }}
              >
                {transactionHash}
              </a>
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default FaucetApp;
