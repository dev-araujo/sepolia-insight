// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title AuditRegistry
 * @notice Fully on-chain registry for smart-contract audit reports.
 *         Stores the complete audit JSON directly on Sepolia testnet.
 *         No external storage (Vercel KV / IPFS) required.
 *
 * Deployment (Sepolia):
 *   1. Compile with solc or Remix
 *   2. Deploy to Sepolia (chainId 11155111)
 *   3. Set NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS in .env.local
 *
 * Gas note: each storeAudit call costs ~50-150k gas depending on JSON size.
 * On Sepolia testnet this is negligible (free faucet ETH).
 */
contract AuditRegistry {
    /// @dev owner => array of audit hashes they've stored
    mapping(address => bytes32[]) private _auditsByOwner;

    /// @dev auditHash => full audit JSON string
    mapping(bytes32 => string) private _auditData;

    /// @dev auditHash => block timestamp when stored
    mapping(bytes32 => uint256) private _auditTimestamp;

    /// @notice Emitted when a new audit is stored
    event AuditStored(
        address indexed owner,
        bytes32 indexed auditHash,
        uint256 timestamp
    );

    /// @notice Store a complete audit report on-chain
    /// @param auditHash  keccak256 of the full audit JSON (for dedup)
    /// @param auditJson  the complete audit JSON string
    function storeAudit(bytes32 auditHash, string calldata auditJson) external {
        require(bytes(auditJson).length > 0, "Audit JSON required");
        require(bytes(_auditData[auditHash]).length == 0, "Audit already stored");

        _auditsByOwner[msg.sender].push(auditHash);
        _auditData[auditHash] = auditJson;
        _auditTimestamp[auditHash] = block.timestamp;

        emit AuditStored(msg.sender, auditHash, block.timestamp);
    }

    /// @notice Get all audit hashes stored by an owner
    function getAuditHashesByOwner(address owner) external view returns (bytes32[] memory) {
        return _auditsByOwner[owner];
    }

    /// @notice Get the full audit JSON for a given hash
    function getAuditData(bytes32 auditHash) external view returns (string memory) {
        return _auditData[auditHash];
    }

    /// @notice Get the timestamp when an audit was stored
    function getAuditTimestamp(bytes32 auditHash) external view returns (uint256) {
        return _auditTimestamp[auditHash];
    }

    /// @notice Get the number of audits stored by an owner
    function getAuditCountByOwner(address owner) external view returns (uint256) {
        return _auditsByOwner[owner].length;
    }

    /// @notice Get a paginated slice of audit hashes for an owner
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
