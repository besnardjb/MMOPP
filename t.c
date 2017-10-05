#include <stdio.h>
#include <mpi.h>

int main( int argc, char *argv[])
{
    int rank, size;
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    printf("Rank: %d/%d\n", rank, size);

    int i;
    for (i = 0; i < 1024; ++i) {
        MPI_Barrier( MPI_COMM_WORLD );
    }


    MPI_Finalize();

    return 0;
}
