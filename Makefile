MPICC=mpicc
PYTHON=python

CFLAGS=-O3 -g

all : libmmopp.so libmmoppf.so test


genf.c : wrapp.w
	$(PYTHON) ./wrap/wrap.py -f -o $@ $^


gen.c : wrapp.w
	$(PYTHON) ./wrap/wrap.py -o $@ $^

libmmopp.so : gen.c timer.c
	$(MPICC)  --shared -o $@ -fpic $^ $(CFLAGS)


libmmoppf.so : genf.c timer.c
	$(MPICC)  --shared -o $@ -fpic $^ $(CFLAGS)



test : t.c libmmopp.so
	$(MPICC) t.c -lmmopp -L. -Wl,-rpath=$(PWD) $(CFLAGS) -o $@


clean:
	rm -fr libmmopp*.so test gen.c
