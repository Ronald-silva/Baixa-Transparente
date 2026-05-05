# Security Specification - Transparência de Pagamentos

## Data Invariants
1. A sale (`Venda`) must belong to a valid vendor and specify a customer.
2. A payment (`Pagamento`) must belong to a valid vendor and specify a customer.
3. Users can only modify their own profile, except for the `role` and `vendedorId` which should be guarded if they are not already set.
4. Vendors can only access data (sales/payments) associated with them.
5. Customers can only access data (sales/payments) associated with them.

## The "Dirty Dozen" Payloads (Deny expected)
1. User A tries to read User B's profile.
2. User A (customer) tries to create a sale for themselves.
3. User A (customer) tries to record a payment for themselves.
4. User A (vendor) tries to read sales of Vendor B.
5. User A tries to delete a sale (Sales should be immutable or only deletable by vendor who created it).
6. User A tries to update the `valorTotal` of a sale after creation.
7. User A tries to set `vendedorId` of a sale to someone else.
8. Attacker tries to inject a 1MB string as a `descricao`.
9. Attacker tries to create a sale with a negative `valorTotal`.
10. Attacker tries to create a payment with a negative `valorPago`.
11. Attacker tries to list all sales without being signed in.
12. Attacker tries to list all users.

## Firestore Rules Draft
I will implement rules that enforce:
- `isSignedIn()`
- `isValidUser()`, `isValidVenda()`, `isValidPagamento()`
- Identity checks: `isOwner()`, `isParticipant()`
- Size limits: 500 chars for descriptions.
- Type checks: numbers for amounts.
