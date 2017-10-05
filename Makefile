MPICC=mpicc
PYTHON=python

CFLAGS=-O3 -g

all : libmmopp.so test


gen.c : gen.py
	$(PYTHON) ./gen.py

libmmopp.so : gen.c timer.c
	$(MPICC) -Dconst="" --shared -o $@ -fpic $^ $(CFLAGS)


test : t.c libmmopp.so
	$(MPICC) t.c -lmmopp -L. -Wl,-rpath=$(PWD) $(CFLAGS) -o $@


clean:
	rm -fr libmmopp.so test gen.c
