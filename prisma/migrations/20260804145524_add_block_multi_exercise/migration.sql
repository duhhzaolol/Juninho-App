-- CreateTable
CREATE TABLE "BlockExercise" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BlockExercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlockExercise" ADD CONSTRAINT "BlockExercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockExercise" ADD CONSTRAINT "BlockExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
