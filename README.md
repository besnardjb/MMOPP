# MMOPP

Minimal Mpi and OpenmP Profiling

## USAGE

Build by running the following command :

```
make
```


## INSTRUMENTATION

The idea between this profiler is to run the profiler alongside a tool
you can LD_PRELOAD the library or simply link it to the binary. In this last
case you have to be careful with library order in order not to call MPI first.


## OUTPUT

For now the output is a simple JSON located in /tmp/lwp\* it is of course to be
enhanced as we progress on the development
