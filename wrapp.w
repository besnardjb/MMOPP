

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>
#include <stdint.h>
#include <string.h>
#include <mpi.h>
#include <pthread.h>

#include "timer.h"


#define MMOPP_STORAGE_VAR "/tmp"
#define MMOPP_ALLOC_ENV_VAR "SLURM_JOB_ID"

typedef enum
{
{{forallfn foo }}
  {{sub {{foo}} MPI_ MMOPP_MPI_}},
{{endforallfn}}
    MMOPP_FUNC_COUNT
}MMOPP_func;



static const char * const get_func_name(MMOPP_func func )
{

    static const char * const __names[MMOPP_FUNC_COUNT] = 
    {
{{forallfn foo }}
  "{{sub {{foo}} MPI_ MMOPP_MPI_}}",
{{endforallfn}}
    };

    return __names[ func ];
}



/* Profiling Data */

struct MMOPP_prof_data{
    unsigned long long hits;
    unsigned long long ticks;
};

static struct MMOPP_prof_data __prof[ MMOPP_FUNC_COUNT ] = {0};


void render_profile()
{
    
    int rank;
    PMPI_Comm_rank(MPI_COMM_WORLD, &rank);

    if( rank )
    {
        PMPI_Reduce( __prof, NULL, MMOPP_FUNC_COUNT * 2, MPI_UNSIGNED_LONG_LONG, MPI_SUM, 0, MPI_COMM_WORLD );
        return;
    }
    else
    {
        PMPI_Reduce( MPI_IN_PLACE, __prof, MMOPP_FUNC_COUNT * 2, MPI_UNSIGNED_LONG_LONG, MPI_SUM, 0, MPI_COMM_WORLD );
    }

    char * path = NULL;
    char * env_path = getenv("MMOPP_OUT");

    FILE * out = NULL;

    if( env_path )
    {
        path = env_path;
        out = fopen(path, "w");
    } else {
        path = strdup(MMOPP_STORAGE_VAR"/lwprofXXXXXX");
        int fd = mkstemp(path);
        out = fdopen( fd, "w" );
        free(path);
    }

    //fprintf(stderr, "Saving MMOPP profile in %s\n", path);

    if(!out)
    {
        return;
    }

    int i;

    fprintf( out, "{\n");

    double mpi_time = 0.0;

    for( i = 0 ; i < MMOPP_FUNC_COUNT ; i++ )
    {
        struct MMOPP_prof_data * e = &__prof[ i ];

            if( e->hits != 0)
            {
                double duration = (double)e->ticks / ticks_per_sec();
                fprintf( out, "\"%s\" : { \"hits\": %llu , \"time\": %g},\n", get_func_name(i), e->hits,  duration );
                mpi_time += duration;
            }
    
    }

    char * alloc_id = getenv(MMOPP_ALLOC_ENV_VAR);

    if(!alloc_id)
    {
        alloc_id = "";
    }

    int comm_size;
    PMPI_Comm_size(MPI_COMM_WORLD, &comm_size);

    fprintf( out, "\"metadata\" : { \"walltime\" : %g, \"walltime_ticks\" : %g, \"size\" : %d, \"alloc_id\" : \"%s\", \"mpi_time\" : %g, \"non_mpi_time\" : %g}\n", walltime(), walltime_ticks(), comm_size, alloc_id, mpi_time , walltime()*comm_size - mpi_time);


    fprintf( out, "\n}\n");

    fclose(out);

}

pthread_mutex_t profile_lock = PTHREAD_MUTEX_INITIALIZER;

{{fnall foo MPI_Finalize MPI_Init MPI_Init_thread}}
    ticks __begin = mmopp_getticks();

    {{callfn}}

    ticks __end = mmopp_getticks();

    pthread_mutex_lock(&profile_lock);
    struct MMOPP_prof_data * ___p = & __prof[ {{sub {{foo}} MPI_ MMOPP_MPI_}} ];
    ___p->hits++;
    ___p->ticks += __end - __begin;
    pthread_mutex_unlock(&profile_lock);
{{endfnall}}

{{fn foo MPI_Finalize}}
  ticks_per_sec_end_cal();
  render_profile();
  {{callfn}}
{{endfn}}


{{fn foo MPI_Init MPI_Init_thread}}
  {{callfn}}
  ticks_per_sec_start_cal();
{{endfn}}
