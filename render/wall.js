
function fill_wall_table()
{
	var prt = $("#WTIMES");

	prt.empty();


	//prt.append("<h3>Walltimes</h3>");

	var tcontent = "<thead><tr><th>Profile</th><th>Walltime</th><th>Number of MPI processes</th></tr></thead>";


	for( var i = 0 ; i < profile_dat.length ; i++ )
	{

		var prof = profile_dat[i];


		var wt = parseFloat(prof["metadata"]["walltime"]);
                var size = prof["metadata"]["size"];

		tcontent += "<tr><td>" + profile_dat[i].___name+ "</td><td>" + to_time( wt ) + "</td><td>" + size + "</td></tr>";

	}

	prt.append("<table class='restable'>" + tcontent + "</table>");

}



function walltime_render()
{
	fill_wall_table();
}
