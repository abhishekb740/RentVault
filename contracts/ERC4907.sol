// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.21;

// Importing OpenZeppelin's ERC721 contract
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IERC4907.sol";

// PUSH Comm Contract Interface
interface IPUSHCommInterface {
    // Function to send a notification
    function sendNotification(
        address _channel,
        address _recipient,
        bytes calldata _identity
    ) external;
}

/// @title ERC4907: Real Estate ERC721 Contract
/// @dev This contract implements an ERC721 token for listing, renting, and managing properties.
contract ERC4907 is ERC721, IERC4907 {
    uint256 tokenIdCounter; // Counter for generating unique token IDs

    // Event emitted when a property is listed for renting
    event PropertyListed(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        string location,
        string imageIPFSHash,
        uint256 price
    );

    // Event emitted when a property is rented
    event PropertyRented(
        uint256 indexed tokenId,
        address indexed user,
        uint256 expires
    );

    // Event emitted when a user's balance is added
    event BalanceAdded(address user, uint256 price);

    // Struct to store information about a listed property
    struct UserInfo {
        address user; // Current user of the property
        uint64 expires; // Expiration timestamp for renting
        string propertyName; // Name of the property
        string location; // Location of the property
        uint256 price; // Price of the property
        string imageIPFSHash; // IPFS hash of the property image
        uint256 tokenId; // ID of the token representing the property
        address owner; // Owner of the property
    }

    // Mapping to store listed properties
    mapping(uint256 => UserInfo) public listedProperties;

    // Mapping to store properties owned by a user
    mapping(address => uint256[]) public userProperties;

    // Mapping to store the total number of properties owned by a user
    mapping(address => uint256) public totalNoOfProperties;

    // Mapping to store user balances
    mapping(address => uint256) public balances;

    /// @dev Constructor to initialize the ERC721 contract
    /// @param name_ The name of the ERC721 token
    /// @param symbol_ The symbol of the ERC721 token
    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {
        tokenIdCounter = 0; // Initialize the token ID counter
    }

    /// @notice Set the user and expiration timestamp of an NFT
    /// @dev The zero address indicates there is no user
    /// Throws if `tokenId` is not a valid NFT
    /// @param tokenId The ID of the NFT
    /// @param _user The new user of the NFT
    /// @param expires The expiration timestamp for renting
    function setUser(
        uint256 tokenId,
        address _user,
        uint64 expires
    ) public virtual override {
        UserInfo storage info = listedProperties[tokenId];
        info.user = _user;
        info.expires = expires;
        emit UpdateUser(tokenId, _user, expires); // Emit an event indicating user update
    }

    /// @notice Rent a property
    /// @param tokenId The ID of the property
    /// @param _user The user renting the property
    /// @param expires The expiration timestamp for renting
    /// @param _price The price for renting the property
    function rentProperty(
        uint256 tokenId,
        address _user,
        uint64 expires,
        uint256 _price
    ) public {
        // Check if the user paid the correct price
        require(
            _price == listedProperties[tokenId].price,
            "Please pay the correct price of the Property"
        );

        // Check if the user has sufficient balance
        require(
            balances[_user] >= _price,
            "Please add sufficient balance to your account"
        );

        // Deduct the price from the user's balance
        balances[_user] -= _price;

        // Set the user and expiration for the property
        setUser(tokenId, _user, expires);

        // Transfer the price to the property owner
        balances[ownerOf(tokenId)] += _price;

        // Send a notification about property rental
        IPUSHCommInterface(0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa)
            .sendNotification(
                0x50b040Ac046e66A91D3B0dB103e025131E29aDE9,
                msg.sender,
                bytes(
                    string(
                        abi.encodePacked(
                            "0",
                            "+",
                            "3",
                            "+",
                            "Property Rent Status",
                            "+",
                            abi.encodePacked(
                                "Property Rented Successfully ",
                                listedProperties[tokenId].propertyName,
                                " at ",
                                listedProperties[tokenId].location,
                                " for ",
                                listedProperties[tokenId].price
                            )
                        )
                    )
                )
            );

        emit PropertyRented(tokenId, _user, expires); // Emit an event for property rental
    }

    /// @notice Get the user address of an NFT
    /// @param tokenId The ID of the NFT
    /// @return The user address for this NFT
    function userOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        if (uint256(listedProperties[tokenId].expires) >= block.timestamp) {
            return listedProperties[tokenId].user;
        } else {
            return ownerOf(tokenId);
        }
    }

    /// @notice Get the expiration timestamp of an NFT
    /// @param tokenId The ID of the NFT
    /// @return The expiration timestamp for this NFT
    function userExpires(uint256 tokenId)
        public
        view
        virtual
        override
        returns (uint256)
    {
        if (uint256(listedProperties[tokenId].expires) >= block.timestamp) {
            return listedProperties[tokenId].expires;
        } else {
            return
                115792089237316195423570985008687907853269984665640564039457584007913129639935;
        }
    }

    /// @dev See {IERC165-supportsInterface}.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(IERC4907).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /// @notice Get all available properties for renting
    /// @return An array of available properties
    function allAvailableRentingProperties()
        public
        view
        returns (UserInfo[] memory)
    {
        uint256 tokenId = tokenIdCounter;
        uint256 propertyCount = 0;
        for (uint256 i = 0; i < tokenId; i++) {
            if (listedProperties[i].expires < block.timestamp) {
                propertyCount++;
            }
        }
        UserInfo[] memory properties = new UserInfo[](propertyCount);
        uint256 j = 0;
        for (uint256 i = 0; i < tokenId; i++) {
            if (listedProperties[i].expires < block.timestamp) {
                properties[j] = listedProperties[i];
                j++;
            }
        }
        return properties;
    }

    /// @notice Get properties owned by the caller
    /// @return An array of properties owned by the caller
    function getUserProperties() public view returns (UserInfo[] memory) {
        UserInfo[] memory properties = new UserInfo[](
            totalNoOfProperties[msg.sender]
        );
        for (uint256 i = 0; i < totalNoOfProperties[msg.sender]; i++) {
            properties[i] = listedProperties[userProperties[msg.sender][i]];
        }
        return properties;
    }

    /// @notice Get properties rented by a specific account
    /// @param _accountAddr The account address to check for rented properties
    /// @return An array of properties rented by the account
    function getRentedProperties(address _accountAddr) public view returns (UserInfo[] memory) {
        uint256 tokenId = tokenIdCounter;
        uint256 propertyCount = 0;
        for (uint256 i = 0; i < tokenId; i++) {
            if (listedProperties[i].expires >= block.timestamp) {
                if (_accountAddr == userOf(i)) {
                    propertyCount++;
                }
            }
        }
        UserInfo[] memory properties = new UserInfo[](propertyCount);
        uint256 j = 0;
        for (uint256 i = 0; i < tokenId; i++) {
            if (listedProperties[i].expires >= block.timestamp) {
                if (_accountAddr == userOf(i)) {
                    properties[j] = listedProperties[i];
                    j++;
                }
            }
        }
        return properties;
    }

    /// @notice Mint a new property NFT
    /// @param _propertyName The name of the property
    /// @param _location The location of the property
    /// @param _price The price of the property
    /// @param _imageIPFSHash The IPFS hash of the property image
    function mint(
        string memory _propertyName,
        string memory _location,
        uint256 _price,
        string memory _imageIPFSHash
    ) public {
        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;
        listedProperties[tokenId] = UserInfo({
            user: address(0),
            expires: 0,
            propertyName: _propertyName,
            location: _location,
            price: _price,
            imageIPFSHash: _imageIPFSHash,
            tokenId: tokenId,
            owner: msg.sender
        });
        userProperties[msg.sender].push(tokenId);
        totalNoOfProperties[msg.sender]++;
        _mint(msg.sender, tokenId); // Mint the new NFT
        // Send a notification about the property registration
        IPUSHCommInterface(0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa)
            .sendNotification(
                0x50b040Ac046e66A91D3B0dB103e025131E29aDE9,
                msg.sender,
                bytes(
                    string(
                        abi.encodePacked(
                            "0",
                            "+",
                            "3",
                            "+",
                            "Property Registration Status",
                            "+",
                            abi.encodePacked(
                                "Property Registered Successfully ",
                                _propertyName,
                                " at ",
                                _location,
                                " for ",
                                _price
                            )
                        )
                    )
                )
            );
        emit PropertyListed(
            tokenId,
            msg.sender,
            _propertyName,
            _location,
            _imageIPFSHash,
            _price
        );
    }

    /// @notice Get the balance of the caller
    /// @return The balance of the caller
    function getUserBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    /// @notice Add balance to the caller's account
    /// @param _amount The amount to add to the balance
    function addUserBalance(uint256 _amount) public {
        balances[msg.sender] += _amount;
        // Send a notification about the balance update
        IPUSHCommInterface(0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa)
            .sendNotification(
                0x50b040Ac046e66A91D3B0dB103e025131E29aDE9,
                msg.sender,
                bytes(
                    string(
                        abi.encodePacked(
                            "0",
                            "+",
                            "3",
                            "+",
                            "Balance Status",
                            "+",
                            abi.encodePacked(
                                "Your balance of ",
                                _amount,
                                " has been successfully added!"
                            )
                        )
                    )
                )
            );
        emit BalanceAdded(msg.sender, _amount); // Emit an event for balance update
    }

    /// @notice Get the current block timestamp
    /// @return The current block timestamp
    function time() public view returns (uint256) {
        return block.timestamp;
    }
}
