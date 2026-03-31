# FramePayTransactionReqBody

**Type**: type

Frame pay transaction request body

Request body for creating a payment transaction within a frame.

**Properties:**

- `transaction:` {@link FramePayTransactionReqBodyTransaction} - Transaction details (amount, recipient, etc.)
- `config:` {@link TransactionFrameConfig} - Transaction frame configuration (chain, contract details)
- `idem?: string` - Idempotency key for preventing duplicate requests (recommended: 16-character unique string)

**Usage Context:**

- Used when creating payment transactions in frames
- Idempotency key ensures retry safety
