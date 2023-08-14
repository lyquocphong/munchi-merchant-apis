-- CreateTable
CREATE TABLE "_BusinessSessionTable" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BusinessSessionTable_AB_unique" ON "_BusinessSessionTable"("A", "B");

-- CreateIndex
CREATE INDEX "_BusinessSessionTable_B_index" ON "_BusinessSessionTable"("B");

-- AddForeignKey
ALTER TABLE "_BusinessSessionTable" ADD CONSTRAINT "_BusinessSessionTable_A_fkey" FOREIGN KEY ("A") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessSessionTable" ADD CONSTRAINT "_BusinessSessionTable_B_fkey" FOREIGN KEY ("B") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
