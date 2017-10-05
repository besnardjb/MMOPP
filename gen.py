#!/usr/bin/env python 
import json
import sys
import os
import string

scriptpath = os.path.dirname(os.path.realpath(sys.argv[0]))

with open(scriptpath + '/mpi.json') as data_file:    
	mpi_interface = json.load(data_file)



def pass_func( name ):
#    if name != "MPI_Send":
#        return 1
    return 0


def get_enum( f ):
	return "MMOPP_" + f.upper()


function_count = 0


for f in mpi_interface:
        if pass_func(f):
            continue
	function_count = function_count + 1

IFACE=""

IFACE+= """
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>
#include <stdint.h>
#include <string.h>
#include <mpi.h>

#include "timer.h"

"""

IFACE += "#define MMOPP_FUNC_COUNT " + str(function_count) + "\n"

IFACE += "typedef enum\n{\n"

for f in mpi_interface:
        if pass_func(f):
            continue
	IFACE += "\t" + get_enum(f) + ",\n"

IFACE += "\n}MMOPP_func;\n"


IFACE += """
static const char * const get_func_name(MMOPP_func func )
{

    static const char * const __names[MMOPP_FUNC_COUNT] = 
    {
"""

for f in mpi_interface:
	if pass_func(f):
		continue
	IFACE += "\t\t\""+ f + "\",\n"

IFACE += """
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

    fprintf( out, "{\\n");

    for( i = 0 ; i < MMOPP_FUNC_COUNT ; i++ )
    {
        struct MMOPP_prof_data * e = &__prof[ i ];

            if( e->hits != 0)
            {
                fprintf( out, "\\"%s\\" : { \\"hits\\": %llu , \\"time\\": %g}\\n", get_func_name(i), e->hits,  (double)e->ticks / ticks_per_sec() );
            }
    
    }

    fprintf( out, "\\n}\\n");

    fclose(out);

}


"""



for f in mpi_interface:
	if pass_func(f):
            continue
	
        fd = mpi_interface[f]
	rtype=""
	if(f=="MPI_Wtime"):
		rtype = "double"
	else:
		rtype = "\n\nint"
	IFACE+= rtype + " " + f + "("
	for i in range(0, len(fd)):
		arg=fd[i]
		name = arg[1];
		ctype = arg[0];
		#ARRAY CASE
		array=""
		try:
			idx=ctype.index("[")
		except ValueError:
			idx=-1
		if idx!=-1:
			array=ctype[idx:]
   			ctype=ctype[0:idx]
		IFACE+=" " + ctype + " " + name + array
		if i < (len(fd) - 1):
			IFACE += ","

	IFACE+= "){\n"
	
        IFACE += rtype + " (*next)("

        for i in range(0, len(fd)):
		arg=fd[i]
		name = arg[1];
		ctype = arg[0];
		#ARRAY CASE
		array=""
		try:
			idx=ctype.index("[")
		except ValueError:
			idx=-1
		if idx!=-1:
			array=ctype[idx:]
         		ctype=ctype[0:idx]
		IFACE+=" " + ctype + " " + array
		if i < (len(fd) - 1):
			IFACE += ","

        IFACE += ");\n next = "
        
        IFACE += "(" + rtype + "(*)("

        for i in range(0, len(fd)):
		arg=fd[i]
		name = arg[1];
		ctype = arg[0];
		#ARRAY CASE
		array=""
		try:
			idx=ctype.index("[")
		except ValueError:
			idx=-1
		if idx!=-1:
			array=ctype[idx:]
         		ctype=ctype[0:idx]
		IFACE+=" " + ctype + " " + array
		if i < (len(fd) - 1):
			IFACE += ","

        
        
        IFACE += ") ) check_load_symbol(" + get_enum(f) + ");\n\n"

        if f == "MPI_Finalize":
            IFACE += "ticks_per_sec_end_cal();\n"
            IFACE += "render_profile();\n"



        IFACE += "ticks __begin = mmopp_getticks();\n"

        IFACE += rtype + " ret = (next)("

        for i in range(0, len(fd)):
		arg=fd[i]
		name = arg[1];
		IFACE+=" " + name + " "
		if i < (len(fd) - 1):
			IFACE += ","

        IFACE += ");\n"
         
        IFACE += "ticks __end = mmopp_getticks();\n"


        if (f == "MPI_Init" or f == "MPI_Init_thread"):
            IFACE += "ticks_per_sec_start_cal();\n"
        else:
            IFACE += "struct MMOPP_prof_data * p = & __prof[" + get_enum(f) + " ];\n";
            IFACE += "p->hits++;\n"
            IFACE += "p->ticks += __end - __begin;\n"
            #IFACE += "fprintf(stderr, \"PT : %lly E : %llu B : %llu\\n\" , __end - __begin, __end, __begin);\n"



        
        IFACE+= "}"

f = open("./gen.c", "w" )

f.write( IFACE );

f.close()


