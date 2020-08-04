# Migration `20200803124208-add_paste_short-id`

This migration has been generated by Ivan Palatov at 8/3/2020, 12:42:08 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Paste" ADD COLUMN "shortId" text  NOT NULL ;

CREATE UNIQUE INDEX "Paste.shortId" ON "public"."Paste"("shortId")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200802180928-made_author_optional..20200803124208-add_paste_short-id
--- datamodel.dml
+++ datamodel.dml
@@ -2,9 +2,9 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
@@ -27,8 +27,9 @@
   views Int @default(0)
   exposure Exposure
   author User? @relation(fields: [authorId], references: [id])
   authorId Int?
+  shortId String @unique
 }
 enum Exposure {
   PRIVATE
```

