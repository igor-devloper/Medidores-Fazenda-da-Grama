/*
  Warnings:

  - You are about to drop the `Leitura` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Medidor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Leitura" DROP CONSTRAINT "Leitura_medidorId_fkey";

-- DropTable
DROP TABLE "Leitura";

-- DropTable
DROP TABLE "Medidor";

-- CreateTable
CREATE TABLE "medidores" (
    "id" SERIAL NOT NULL,
    "idVirtual" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "enderecoMAC" TEXT NOT NULL,
    "fusoHorario" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "forcaSinal" TEXT,
    "ultimaLeitura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tuyaDeviceId" TEXT,
    "nome" TEXT,
    "localizacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medidores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leituras" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'power',
    "unidade" TEXT NOT NULL DEFAULT 'W',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medidorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leituras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medidores_idVirtual_key" ON "medidores"("idVirtual");

-- CreateIndex
CREATE UNIQUE INDEX "medidores_enderecoMAC_key" ON "medidores"("enderecoMAC");

-- AddForeignKey
ALTER TABLE "leituras" ADD CONSTRAINT "leituras_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "medidores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
