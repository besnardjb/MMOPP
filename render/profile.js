var profile_dat = [];


function to_time( time )
{
	if( typeof(time) == "string" )
		time = parseFloat(time.replace(',', '.'));

	var r = time;
	var ret = "";

	

	if( 1 <= r )
	{
		var days = Math.floor( r / (3600 * 24 ) );
		r = r - days*(3600 * 24 );
		var hour = Math.floor( r / (3600) );
		r = r - hour*(3600);
		var m = Math.floor( r / (60) );
		r = r - m*(60);
		var s = r;

		if( days )
			ret += days + " days ";

		if( hour )
			ret += hour + " h ";

		if( m )
			ret += m + " m ";

		if( s )
			ret += s.toFixed(3) + " s";
	}
	else
	{
		if( r < 1e-6 )
			ret = (r * 1e9).toFixed(3) + " ns";
		else
			if( r < 1e-3 )
				ret = (r * 1e6).toFixed(3) + " us";
			else
				ret = (r * 1e3).toFixed(3) + " ms";
	}

	return ret
}


function skip_key(k)
{
	if( k == "NULL")
		return 1;

	if( k.match("___*"))
		return 1;

        if( k == "metadata")
            return 1;

	return 0;
}

function fill_prof_table()
{
	var prt = $("#PROF");

	prt.empty();

	for( var i = 0 ; i < profile_dat.length ; i++ )
	{

		var prof = profile_dat[i];


		prt.append("<h3>" + profile_dat[i].___name + "</h3>");

		var tcontent = "";

		tcontent += "<thead><tr><th>Function</th><th class='sorttable_numeric'  >Calls</th><th class='sorttable_numeric'  >Total Time</th><th class='sorttable_numeric'  >Average Time</th> </tr></thead>";

		
		eprof = [];

		for( var v in prof )
		{
			if( skip_key(v) )
				continue;
			
			prof[v].name = v;
			eprof.push( prof[v] );
		}
		
		eprof.sort( function( a , b ){
			if( typeof(a.total_time) == "string" )
				a.total_time.replace(/,/g, '.');
				
			if( typeof(b.total_time) == "string" )
				b.total_time.replace(/,/g, '.');
				
			return parseFloat(b.total_time) - parseFloat(a.total_time); 
		}); 
		
		for( var k = 0 ; k < eprof.length ; k++ )
		{

			var e = eprof[k];

			tcontent += "<tr><td>" +e.name.replace("MMOPP_", "") + "</td><td>" + e.hits + "</td><td>" + to_time( e.time ) + "</td> <td>" + to_time( parseFloat(e.time) / parseFloat(e.hits) ) + "</td></tr>";
		}

		prt.append("<table class='restable'>" + tcontent + "</table>");

	}


}



function profile_render()
{
	fill_prof_table();

}
