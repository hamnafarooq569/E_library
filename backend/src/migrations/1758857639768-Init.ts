import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758857639768 implements MigrationInterface {
    name = 'Init1758857639768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notes" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text, "tags" text, "fileName" character varying NOT NULL, "originalName" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" bigint NOT NULL, "approved" boolean NOT NULL DEFAULT false, "downloads" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "uploaderId" integer, CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_236f4b6762c3c3786932d0786e" ON "notes" ("title") `);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_620ce951111584af117667f915b" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_620ce951111584af117667f915b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_236f4b6762c3c3786932d0786e"`);
        await queryRunner.query(`DROP TABLE "notes"`);
    }

}
