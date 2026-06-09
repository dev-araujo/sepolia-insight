// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AuditRegistry {
    mapping(address => bytes32[]) private _auditsByOwner;
    mapping(bytes32 => string) private _auditData;
    mapping(bytes32 => uint256) private _auditTimestamp;

    event AuditStored(
        address indexed owner,
        bytes32 indexed auditHash,
        uint256 timestamp
    );

    function storeAudit(bytes32 auditHash, string calldata auditJson) external {
        require(bytes(auditJson).length > 0, "Audit JSON required");
        require(bytes(_auditData[auditHash]).length == 0, "Audit already stored");

        _auditsByOwner[msg.sender].push(auditHash);
        _auditData[auditHash] = auditJson;
        _auditTimestamp[auditHash] = block.timestamp;

        emit AuditStored(msg.sender, auditHash, block.timestamp);
    }

    function getAuditHashesByOwner(address owner) external view returns (bytes32[] memory) {
        return _auditsByOwner[owner];
    }

    function getAuditData(bytes32 auditHash) external view returns (string memory) {
        return _auditData[auditHash];
    }

    function getAuditTimestamp(bytes32 auditHash) external view returns (uint256) {
        return _auditTimestamp[auditHash];
    }

    function getAuditCountByOwner(address owner) external view returns (uint256) {
        return _auditsByOwner[owner].length;
    }

    function getAuditHashesByOwnerPaginated(
        address owner,
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory, uint256) {
        bytes32[] storage all = _auditsByOwner[owner];
        uint256 total = all.length;

        if (offset >= total) return (new bytes32[](0), total);

        uint256 end = offset + limit;
        if (end > total) end = total;

        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = all[i];
        }
        return (result, total);
    }
}
