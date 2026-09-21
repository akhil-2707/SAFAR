const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data; // { touristIdHash, digitalIdHash, verificationStatus, nonSensitiveMeta }
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.data) +
          this.nonce
      )
      .digest('hex');
  }

  // Simple Proof-of-Work / Mining simulation for prototype ledger
  mineBlock(difficulty = 1) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class PrototypeBlockchainLedger {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 1;
    this.isTampered = false;
    this.tamperedBlockIndex = null;
    this.backupChain = null;
  }

  createGenesisBlock() {
    const genesisData = {
      touristIdHash: crypto.createHash('sha256').update('GENESIS_SAFE_TOUR_NE_NODE_0').digest('hex'),
      digitalIdHash: crypto.createHash('sha256').update('GENESIS_DIGITAL_ID_0000').digest('hex'),
      verificationStatus: 'GENESIS_VERIFIED',
      issuer: 'S.A.F.A.R. National Tourism Safety Authority',
      network: 'Prototype Blockchain Ledger (Private Consensus)',
      timestamp: new Date('2026-01-01T00:00:00Z').toISOString()
    };
    return new Block(0, '2026-01-01T00:00:00Z', genesisData, '0'.repeat(64));
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlockData) {
    const latestBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      newBlockData,
      latestBlock.hash
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  verifyChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Re-calculate hash
      const recalculatedHash = crypto
        .createHash('sha256')
        .update(
          currentBlock.index +
            currentBlock.previousHash +
            currentBlock.timestamp +
            JSON.stringify(currentBlock.data) +
            currentBlock.nonce
        )
        .digest('hex');

      if (currentBlock.hash !== recalculatedHash) {
        return {
          isValid: false,
          error: `Tampering Detected! Current block #${currentBlock.index} hash mismatch. Expected ${recalculatedHash}, found ${currentBlock.hash}.`,
          invalidBlockIndex: i
        };
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          error: `Chain Broken! Block #${currentBlock.index} previousHash (${currentBlock.previousHash.substring(0, 16)}...) does not match Block #${previousBlock.index} hash (${previousBlock.hash.substring(0, 16)}...).`,
          invalidBlockIndex: i
        };
      }
    }

    return {
      isValid: true,
      message: '✓ Prototype Blockchain Ledger Integrity Verified (All SHA-256 Hashes Valid)',
      totalBlocks: this.chain.length
    };
  }

  verifyDigitalID(touristId, digitalIdHash) {
    const touristIdHash = crypto.createHash('sha256').update(touristId).digest('hex');

    // Find block matching the digitalIdHash or touristIdHash
    const matchingBlock = this.chain.find(
      (b) => b.data && (b.data.digitalIdHash === digitalIdHash || b.data.touristIdHash === touristIdHash)
    );

    const chainAudit = this.verifyChain();

    if (!matchingBlock) {
      return {
        verified: false,
        reason: 'Digital ID hash not found in prototype ledger records',
        chainValid: chainAudit.isValid
      };
    }

    if (!chainAudit.isValid) {
      return {
        verified: false,
        reason: 'Ledger Tamper Alert: Chain integrity check failed',
        matchingBlock,
        chainValid: false,
        auditDetails: chainAudit
      };
    }

    return {
      verified: true,
      matchingBlock,
      chainValid: true,
      verificationHash: matchingBlock.hash,
      issuedAt: matchingBlock.timestamp,
      blockIndex: matchingBlock.index,
      previousHash: matchingBlock.previousHash,
      ledgerProof: `SHA256:${matchingBlock.hash}`
    };
  }

  // SIH Judge Demo Function: Simulate Tampering
  tamperLedgerForDemo(targetIndex = 1) {
    if (this.chain.length <= targetIndex) {
      targetIndex = Math.max(1, this.chain.length - 1);
    }
    // Save backup first if not already saved
    if (!this.backupChain) {
      this.backupChain = JSON.parse(JSON.stringify(this.chain));
    }
    
    // Tamper block data directly without recalculating hashes
    this.chain[targetIndex].data.verificationStatus = 'TAMPERED_UNAUTHORIZED_ALTERATION';
    this.chain[targetIndex].data.issuer = 'MALICIOUS_ATTACKER_INJECTED_DATA';
    this.isTampered = true;
    this.tamperedBlockIndex = targetIndex;

    return {
      success: true,
      message: `Block #${targetIndex} data modified maliciously! Run verification audit to observe failure.`,
      tamperedBlockIndex: targetIndex
    };
  }

  // SIH Judge Demo Function: Restore Ledger
  restoreLedgerForDemo() {
    if (this.backupChain) {
      this.chain = JSON.parse(JSON.stringify(this.backupChain));
      this.backupChain = null;
    } else {
      // Re-mine and re-hash all blocks
      for (let i = 1; i < this.chain.length; i++) {
        if (this.chain[i].data.verificationStatus === 'TAMPERED_UNAUTHORIZED_ALTERATION') {
          this.chain[i].data.verificationStatus = 'VERIFIED';
          this.chain[i].data.issuer = 'S.A.F.A.R. National Tourism Safety Authority';
        }
        this.chain[i].previousHash = this.chain[i - 1].hash;
        this.chain[i].hash = this.chain[i].calculateHash();
      }
    }
    this.isTampered = false;
    this.tamperedBlockIndex = null;

    return {
      success: true,
      message: 'Ledger integrity successfully restored. All SHA-256 chain links verified.'
    };
  }
}

const blockchainInstance = new PrototypeBlockchainLedger();

module.exports = {
  Block,
  PrototypeBlockchainLedger,
  blockchainInstance
};
