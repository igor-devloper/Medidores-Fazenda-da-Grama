-- CreateTable
CREATE TABLE "Medidor" (
    "id" SERIAL NOT NULL,
    "idVirtual" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "enderecoMAC" TEXT NOT NULL,
    "fusoHorario" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "forcaSinal" TEXT,
    "ultimaLeitura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medidor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leitura" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medidorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leitura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medidor_idVirtual_key" ON "Medidor"("idVirtual");

-- CreateIndex
CREATE UNIQUE INDEX "Medidor_enderecoMAC_key" ON "Medidor"("enderecoMAC");

-- AddForeignKey
ALTER TABLE "Leitura" ADD CONSTRAINT "Leitura_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "Medidor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
