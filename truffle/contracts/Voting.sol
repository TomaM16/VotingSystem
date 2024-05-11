pragma solidity >=0.5.16;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        string description;
        string imageUrl;
        uint256 votes;
    }

    Candidate[] public candidates;
    uint256 public candidatesCount;

    address public owner;

    mapping(address => bool) public voters;
    address[] public listOfVoters;

    event VoteCast(uint256 indexed candidateId, uint256 totalVotes);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized!");
        _;
    }

    constructor() public {
        owner = msg.sender;
        candidatesCount = 0;

        addCandidate("Bernard Arnault", "CEO of LVMH, oversees the world's foremost luxury goods conglomerate.", "https://cdn.britannica.com/09/225009-050-9BA6E880/French-businessman-Bernard-Arnault-2017.jpg");
        addCandidate("Elon Musk", "Founder of SpaceX and Tesla, leading innovations in space and automotive industries.", "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRy5QMODyHm-LaMpgXOqMIUHPbQ-Y51jAZR_UJYC-9Dv1IL3ovh");
        addCandidate("Jeff Bezos", "Founder of Amazon, pioneer in e-commerce and cloud computing, and space exploration with Blue Origin.", "https://m.media-amazon.com/images/M/MV5BYTNlOGZhYzgtMmE3OC00Y2NiLWFhNWQtNzg5MjRhNTJhZGVmXkEyXkFqcGdeQXVyNzg5MzIyOA@@._V1_.jpg");
        addCandidate("Mark Zuckerberg", "Founder of Facebook, now Meta, revolutionizing social media and virtual connectivity.", "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQudfLLk1p5Z0HecLq3BENiUzI46TSBa3am0OU37r2mmppighAg");
        addCandidate("Larry Ellison", "Co-founder of Oracle, innovator in database technology and enterprise software solutions.", "https://imageio.forbes.com/specials-images/imageserve/5e8b62cfc095010007bffea0/0x0.jpg?format=jpg&crop=4529,4532,x0,y652,safe&height=416&width=416&fit=bounds");
    }

    function addCandidate(string memory _name, string memory _description, string memory _imageUrl) public onlyOwner {
        candidates.push(Candidate({
            id: candidates.length,
            name: _name,
            description: _description,
            imageUrl: _imageUrl,
            votes: 0
        }));
        candidatesCount++;
    }

    function voterStatus(address _voter) public view returns (bool) {
        return voters[_voter];
    }

    function voteTo(uint256 _id) public {
        require(!voterStatus(msg.sender), "You already voted. You can only vote once.");
        candidates[_id].votes++;
        voters[msg.sender] = true;
        listOfVoters.push(msg.sender);

        emit VoteCast(_id, candidates[_id].votes);
    }

    function resetVoting() public onlyOwner {
        for(uint256 i = 0; i < listOfVoters.length; i++) {
            voters[listOfVoters[i]] = false;
        }

        delete listOfVoters;
        delete candidates;
    }
}