// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.21;
// 0x7893fBa2c1f24E315A6B40F6F675948885B7734C
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IERC4907.sol";

// PUSH Comm Contract Interface
interface IPUSHCommInterface {
    function sendNotification(
        address _channel,
        address _recipient,
        bytes calldata _identity
    ) external;
}

contract ERC4907 is ERC721, IERC4907 {
    uint256 tokenIdCounter;
    event PropertyListed(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        string location,
        string imageIPFSHash,
        uint256 price
    );
    event PropertyRented(
        uint256 indexed tokenId,
        address indexed user,
        uint256 expires
    );
    struct UserInfo {
        address user;
        uint64 expires;
        string propertyName;
        string location;
        uint256 price;
        string imageIPFSHash;
        uint256 tokenId;
        address owner;
    }

    mapping(uint256 => UserInfo) public listedProperties;
    mapping(address => uint256[]) public userProperties;
    mapping(address => uint256) public totalNoOfProperties;
    mapping(address => uint256) public balances;

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {
        tokenIdCounter = 0;
    }

    /// @notice set the user and expires of an NFT
    /// @dev The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT
    /// @param _user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires
    function setUser(
        uint256 tokenId,
        address _user,
        uint64 expires
    ) public virtual override {
        UserInfo storage info = listedProperties[tokenId];
        info.user = _user;
        info.expires = expires;
        emit UpdateUser(tokenId, _user, expires);
    }

    function rentProperty(
        uint256 tokenId,
        address _user,
        uint64 expires,
        uint256 _price
    ) public {
        require(
            _price == listedProperties[tokenId].price,
            "Please pay the correct price of the Property"
        );
        setUser(tokenId, _user, expires);
        balances[ownerOf(tokenId)] += _price;
        IPUSHCommInterface(0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa)
            .sendNotification(
                0x50b040Ac046e66A91D3B0dB103e025131E29aDE9,
                msg.sender,
                bytes(
                    string(
                        abi.encodePacked(
                            "0", // this represents minimal identity, learn more: https://push.org/docs/notifications/notification-standards/notification-standards-advance/#notification-identity
                            "+", // segregator
                            "3", // define notification type:  https://push.org/docs/notifications/build/types-of-notification (1, 3 or 4) = (Broadcast, targeted or subset)
                            "+", // segregator
                            "Property Rent Status", // this is notificaiton title
                            "+", // segregator
                            abi.encodePacked("Property Rented Successfully ",listedProperties[tokenId].propertyName," at ", listedProperties[tokenId].location, " for ", listedProperties[tokenId].price) // notification body
                        )
                    )
                )
            );
        emit PropertyRented(tokenId, _user, expires);
    }

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
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

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
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

    // function _beforeTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 tokenId,
    //     uint256 /** batch **/
    // ) internal virtual override {
    //     if (from != to && listedProperties[tokenId].user != address(0)) {
    //         delete listedProperties[tokenId];
    //         emit UpdateUser(tokenId, address(0), 0);
    //     }
    // }

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

    function getUserProperties() public view returns (UserInfo[] memory) {
        UserInfo[] memory properties = new UserInfo[](
            totalNoOfProperties[msg.sender]
        );
        for (uint256 i = 0; i < totalNoOfProperties[msg.sender]; i++) {
            properties[i] = listedProperties[userProperties[msg.sender][i]];
        }
        return properties;
    }

    function getRentedProperties() public view returns (UserInfo[] memory) {
        uint256 tokenId = tokenIdCounter;
        uint256 propertyCount = 0;
        for (uint256 i = 0; i < tokenId; i++) {
            if (listedProperties[i].expires >= block.timestamp) {
                if (msg.sender == userOf(i)) {
                    propertyCount++;
                }
            }
        }
        UserInfo[] memory properties = new UserInfo[](propertyCount);
        uint256 j = 0;
        for (uint256 i = 0; i < tokenId; i++) {
            if (listedProperties[i].expires >= block.timestamp) {
                if (msg.sender == userOf(i)) {
                    properties[j] = listedProperties[i];
                    j++;
                }
            }
        }
        return properties;
    }

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
        _mint(msg.sender, tokenId);
        IPUSHCommInterface(0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa)
            .sendNotification(
                0x50b040Ac046e66A91D3B0dB103e025131E29aDE9,
                msg.sender,
                bytes(
                    string(
                        abi.encodePacked(
                            "0", // this represents minimal identity, learn more: https://push.org/docs/notifications/notification-standards/notification-standards-advance/#notification-identity
                            "+", // segregator
                            "3", // define notification type:  https://push.org/docs/notifications/build/types-of-notification (1, 3 or 4) = (Broadcast, targeted or subset)
                            "+", // segregator
                            "Property Registration Status", // this is notificaiton title
                            "+", // segregator
                            abi.encodePacked("Property Registered Successfully ", _propertyName, " at ", _location, " for ", _price) // notification body
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

    function getUserBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function time() public view returns (uint256) {
        return block.timestamp;
    }
}
