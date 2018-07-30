#ifndef TIMER_H
#define TIMER_H

#include "cycle.h"


double ticks_per_sec();

void ticks_per_sec_start_cal();
void ticks_per_sec_end_cal();

ticks ticks_comp();

extern ticks __compensation_ticks;

static inline ticks mmopp_getticks()
{
	return getticks() - __compensation_ticks;
}

double walltime();
double walltime_ticks();

#endif /* end of include guard: TIMER_H */
