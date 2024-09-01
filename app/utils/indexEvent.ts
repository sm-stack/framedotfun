import { createPublicClient, http, decodeEventLog } from 'viem';
import { baseSepolia } from 'viem/chains';

// ABI for the TokenCreated event
const eventAbi = [
    {
        type: 'event',
        name: 'TokenCreated',
        inputs: [
            { indexed: true, name: 'token', type: 'address' },
            { indexed: false, name: 'name', type: 'string' },
            { indexed: false, name: 'symbol', type: 'string' },
            { indexed: true, name: 'reserveToken', type: 'address' }
        ]
    }
];

export async function findTokenCreatedEvent(txHash: `0x${string}`): Promise<any> {
    const client = createPublicClient({
        chain: baseSepolia,
        transport: http("https://base-sepolia.blockpi.network/v1/rpc/public"), // Replace with your provider URL
    });
  
    try {
        // Fetch the transaction receipt
        const receipt = await client.getTransactionReceipt({ hash: txHash });

        if (!receipt) {
            console.log("Transaction receipt not found");
            return;
        }

        // Iterate over each log in the transaction receipt
        for (const log of receipt.logs) {
            try {
                // Decode the log using the ABI definition
                const decodedLog = decodeEventLog({
                    abi: eventAbi,
                    data: log.data,
                    topics: log.topics,
                });

                if (decodedLog) {
                    if (decodedLog.args) {
                        return decodedLog.args;
                    }
                    return;
                } else {
                    return ''
                }
            } catch (error) {
                // Ignore logs that do not match the event signature
                continue;
            }
        }

        console.log("No TokenCreated event found in this transaction.");
        return '';
    } catch (error) {
        console.error("Error fetching transaction receipt or decoding logs:", error);
        return '';
    }
}
