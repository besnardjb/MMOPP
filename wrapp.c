#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>

#define MMOPP_FUNC_COUNT 1


typedef enum
{
    MMPOPP_MPI_INIT,
}MMOPP_func;

static const char * const get_func_name(MMOPP_func func )
{

    static const char * const __names[MMOPP_FUNC_COUNT] = 
    {
        "MPI_Init"
    };

    return __names[ func ];
}


static inline void * check_load_symbol( MMOPP_func f)
{
    static void * __functions[MMOPP_FUNC_COUNT] = {0};
 
    void * current = __functions[ f ];

    if( current )
    {
        return current;
    }

    const char * const name = get_func_name( f );

    if( !name )
    {
        abort();
    }

    void * next = dlsym( RTLD_NEXT, name );

    if( !next )
    {
        fprintf(stderr, "Could not load next symbol for %s", name);
    }

    __functions[ f ] = next;

    return next;
}




int MPI_Init( int * argc , char *** argv )
{
    int (*next)(int *, char ***) = check_load_symbol( MMPOPP_MPI_INIT );


    fprintf(stderr, "In wrapp %s\n", get_func_name(MMPOPP_MPI_INIT));
    
    int ret = (next)( argc, argv );

    fprintf(stderr, "Out wrapp %s\n", get_func_name(MMPOPP_MPI_INIT));

    return ret;
}
