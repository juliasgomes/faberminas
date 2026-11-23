# Security Specification — Faberminas Firestore

## 1. Data Invariants
1. **Storefront Public Read / Admin-Only Write**: Public visitors can read `site_settings/global`, `products/{productId}`, and `banners/{bannerId}` so the catalog and photos load across every browser and device. Only verified administrators (`email_verified == true` and bootstrapped admin email or `/admins/{uid}`) may create, update, or delete storefront documents.
2. **No Shadow Fields**: Every document write validates exact required and allowed keys via `hasAll` + `hasOnly` and `affectedKeys().hasOnly(...)` on update.
3. **Bounded Payloads (< 1MB Firestore Limit)**: Every string field (including compressed Base64 Data URLs) and array field enforces strict `.size()` bounds matching `firebase-blueprint.json`.
4. **Path & ID Integrity**: All single-document operations enforce `isValidId()` (`^[a-zA-Z0-9_\-]+$`, max 128 chars). Product `id` and Banner `id` are immutable after creation.
5. **Email Spoofing Guard**: Admin privileges require `request.auth.token.email_verified == true`.

## 2. Adversarial "Dirty Dozen" Payloads Tested
1. Unauthenticated `create` on `/products/999` -> `PERMISSION_DENIED`.
2. Signed-in non-admin user `update` on `/site_settings/global` -> `PERMISSION_DENIED`.
3. Spoofed admin email with `email_verified: false` attempting `setDoc` on `/banners/slide-1` -> `PERMISSION_DENIED`.
4. Shadow field injection (`isAdmin: true` or `extraField: 1`) on `/products/10` -> `PERMISSION_DENIED`.
5. Oversized image string (> 700,000 chars) on `/products/10` -> `PERMISSION_DENIED`.
6. Invalid ID path poisoning (`/products/bad..id`) -> `PERMISSION_DENIED`.
7. Mutating immutable `id` field on `/products/10` during `update` -> `PERMISSION_DENIED`.
8. Invalid banner `kind: 'malicious'` on `/banners/b1` -> `PERMISSION_DENIED`.
9. Self-escalation by creating `/admins/{myUid}` as a regular user -> `PERMISSION_DENIED`.
10. Blanket read/list on `/site_settings` -> `PERMISSION_DENIED`.
11. Unbounded `rooms` array (> 30 items) on `/products/10` -> `PERMISSION_DENIED`.
12. Negative/zero `qtdMinima: 0` on `/products/10` -> `PERMISSION_DENIED`.
