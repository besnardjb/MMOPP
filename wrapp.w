

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>
#include <stdint.h>
#include <string.h>
#include <mpi.h>

#include "timer.h"

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

    char * path = strdup("/tmp/lwprofXXXXXX");
    int fd = mkstemp(path);

    if( fd < 0 )
    {
        return;
    }

    free(path);

    FILE * out = fdopen( fd, "w" );

    int i;

    fprintf( out, "{\n");

    for( i = 0 ; i < MMOPP_FUNC_COUNT ; i++ )
    {
        struct MMOPP_prof_data * e = &__prof[ i ];

            if( e->hits != 0)
            {
                fprintf( out, "\"%s\" : { \"hits\": %llu , \"time\": %g}\n", get_func_name(i), e->hits,  (double)e->ticks / ticks_per_sec() );
            }
    
    }

    fprintf( out, "\n}\n");

    fclose(out);

}

{{fnall foo MPI_Finalize}}
    ticks __begin = mmopp_getticks();

    {{callfn}}

    ticks __end = mmopp_getticks();

    struct MMOPP_prof_data * ___p = & __prof[ {{sub {{foo}} MPI_ MMOPP_MPI_}} ];
    ___p->hits++;
    ___p->ticks += __end - __begin;
{{endfnall}}

{{fn foo MPI_Finalize}}
  render_profile();
  {{callfn}}
{{endfn}}
