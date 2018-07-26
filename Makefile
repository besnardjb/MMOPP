MPICC=mpicc
MPIF77=mpif77
PYTHON=python

CFLAGS=-O3 -g

all : libmmopp.so libmmoppf.so test heat


genf.c : wrapp.w
	$(PYTHON) ./wrap/wrap.py -f -o $@ $^


gen.c : wrapp.w
	$(PYTHON) ./wrap/wrap.py -o $@ $^

libmmopp.so : gen.c timer.c
	$(MPICC)  --shared -o $@ -fpic $^ $(CFLAGS)


libmmoppf.so : genf.c timer.c
	$(MPICC)  --shared -o $@ -fpic $^ $(CFLAGS)


heat : heat_mpi.f libmmoppf.so
	$(MPIF77) heat_mpi.f -lmmoppf -L. -Wl,-rpath=$(PWD) $(CFLAGS) -o $@


test : t.c libmmopp.so
	$(MPICC) t.c -lmmopp -L. -Wl,-rpath=$(PWD) $(CFLAGS) -o $@


clean:
	rm -fr libmmopp*.so test gen.c heat
