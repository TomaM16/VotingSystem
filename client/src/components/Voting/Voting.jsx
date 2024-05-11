import * as React from "react";
import { useEffect, useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function Voting() {

    const { state } = useEth();

    const [candidates, setCandidates] = useState([]);
    const [hasVoted, setHasVoted] = useState([]);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const candidatesCount = await state.contract.methods.candidatesCount().call();
                const candidatesArray = [];
                for (let i = 0; i < candidatesCount; i++) {
                    const candidate = await state.contract.methods.candidates(i).call();
                    candidatesArray.push(candidate);
                }
                setCandidates(candidatesArray);

                console.log(candidatesArray)
            } catch (error) {
                console.error("Error fetching candidates:", error);
            }
        };

        if (state.contract) {
            fetchCandidates();
        }
    }, [state.contract]);

    useEffect(() => {
        const setupEventListeners = async () => {
            const { web3, contract } = state;
            if (contract) {
                const voteEvent = contract.events.VoteCast({
                    fromBlock: 'latest'
                })
                    .on('data', (event) => {
                        const { candidateId, totalVotes } = event.returnValues;

                        console.log(`Vote cast for candidate ${candidateId}. Total now: ${totalVotes}`);

                        setCandidates(prevCandidates =>
                            prevCandidates.map(candidate =>
                                candidate.id === candidateId ? { ...candidate, votes: totalVotes } : candidate
                            )
                        );
                    })
                    .on('error', (error) => {
                        console.error("Event listening error:", error);
                    });

                return () => {
                    voteEvent.unsubscribe();
                };
            }
        };

        setupEventListeners();
    }, [state.contract]);

    const handleVote = async (candidateId) => {
        try {
            // Ensure there is an account available
            const accounts = await state.web3.eth.getAccounts();
            if (accounts.length === 0) {
                console.error("No accessible accounts. Check if your wallet is connected.");
                return;
            }

            const hasVoted = await state.contract.methods.voterStatus(accounts[0]).call();
            if (hasVoted) {
                setHasVoted(true);
                alert("You already voted. You can only vote once.");
                return;
            }

            sendVote(candidateId, accounts[0]);

            console.log(`Vote cast for candidate ID ${candidateId}`);
        } catch (error) {
            console.error("Failed to cast vote:", error);
            console.log(JSON.stringify(error, null, 2));  // This will show you the full structure of the error object.

            if (error.message.includes("revert")) {
                const revertReason = extractRevertReason(error.message);
                alert(revertReason);
            } else {
                alert("Failed to send transaction.");
            }
        }
    };

    async function sendVote(candidateId, fromAddress) {
        try {
            await state.contract.methods.voteTo(candidateId).send({ from: fromAddress });
            console.log(`Vote cast for candidate ID ${candidateId}`);
        } catch (error) {
            console.error("Failed to cast vote:", error);
            alert("Transaction failed: " + (error.message || "Unknown error"));
        }
    }

    function extractRevertReason(error) {
        if (error.message.includes('revert')) {
            const result = error.message.match(/revert\s+([\s\S]*)/); // [\s\S]* to match new lines as well
            return result ? result[1].trim() : "Revert reason not captured";
        }
        if (error.data) {
            for (let key in error.data) {
                if (error.data[key].reason) {
                    return error.data[key].reason;
                }
            }
        }
        return "Unknown error"; // Default message if nothing is extracted
    }

    return (
        <div>
            <h2 className="vote-title">Vote for Your Candidate</h2>
            <div className="candidates-container">
                {candidates.map((candidate, index) => (
                    <div key={index} className="candidate-container">
                        <img src={candidate.imageUrl} alt={candidate.name} className="candidate-img" />
                        <div className="candidate-information-container">
                            <h3>{candidate.name}</h3>
                            <p>{candidate.description}</p>
                            <p className="candidate-votes">Votes: {candidate.votes}</p>
                            <button className="candidate-vote-button" onClick={() => handleVote(candidate.id)}>Vote</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Voting;
