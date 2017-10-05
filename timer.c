#include "timer.h"

#include <stdio.h>
#include <sys/time.h>
#include <mpi.h>

static double __ticks_per_second = 0.0;

ticks __compensation_ticks = 0.0;

ticks ticks_comp()
{
	return __compensation_ticks;
}


double ticks_per_sec()
{
	return __ticks_per_second;
}

static ticks start_ts = 0.0; 
static ticks end_ts = 0.0; 

struct timeval tv_start, tv_end;

void ticks_per_sec_start_cal()
{
	gettimeofday( &tv_start , NULL );
	start_ts = getticks();

	PMPI_Barrier(MPI_COMM_WORLD);
	PMPI_Barrier(MPI_COMM_WORLD);
	__compensation_ticks = getticks();
	PMPI_Barrier(MPI_COMM_WORLD);

}

void ticks_per_sec_end_cal()
{
	gettimeofday( &tv_end , NULL );
	end_ts = getticks();

	double start_time = (tv_start.tv_usec) * 1.0e-06 + (tv_start.tv_sec) * 1.0;
	double end_time = (tv_end.tv_usec) * 1.0e-06 + (tv_end.tv_sec) * 1.0;


	__ticks_per_second = ( (double)(end_ts - start_ts) ) / ( end_time - start_time );

}


