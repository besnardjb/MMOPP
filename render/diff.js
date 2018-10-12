

function fill_diff_table( data , ref_key )
{
	var prt = $("#DIFF");

	var has_time = 0;

	if( ref_key.includes( "time" ) )
		has_time = 1;


	/* Create the per_function table */
	
	var existing_keys = {};
	
	for( var i = 0 ; i < data.length ; i++ )
	{
		var prof = data[i];
		for( var v in prof )
		{
			if( skip_key(v) )
				continue;
			
			existing_keys[ v ] = 1;
		}
	}	

	var tcontent = "";

	tcontent += "<thead><tr><th>Function</th>";
	
	for( var i = 0 ; i < data.length ; i++ )
	{	
		var prof = data[i];
		tcontent += "<th>" + prof.___name + "</th>"
	}	
	
	tcontent += "</tr></thead>";


	for( var k in existing_keys )
	{
		/* The all equal case */
		var all_equal = 1;
		
		var ref = null;
		for( var i = 0 ; i < data.length ; i++ )
		{

			var prof = data[i];	
			
			if( ref == null )
				ref = prof[k][ ref_key ];
			
			if( ref != null )
			{
				if( ref != prof[k][ ref_key ] )
				{
					all_equal = 0;
					break;
				}
			}
		}
		
		var min_ref = null;
		var min_idx = null;
		var max_ref = null;
		var max_idx = null;
	
		for( var i = 0 ; i < data.length ; i++ )
		{

			var prof = data[i];	
			
			if( min_ref == null )
				min_ref = prof[k][ ref_key ];
			
			if( min_ref != null )
			{
				if( prof[k][ ref_key ] < min_ref )
				{
					min_ref = prof[k][ ref_key ];
					min_idx = i;
				}
			}
			
			if( max_ref == null )
				max_ref = prof[k][ ref_key ];
			
			if( max_ref != null )
			{
				if( max_ref < prof[k][ ref_key ] )
				{
					max_ref = prof[k][ ref_key ];
					max_idx = i;
				}
			}
		}
		
		tcontent += "<tr><td>" + k.replace("MMOPP_", "") + "</td>"

		var ranks = [];

		for( var i = 0 ; i < data.length ; i++ )
		{
			
			if( all_equal )
			{
					ranks[i] = { "slot" : i , "rank" : -1 , "val" : e };
			}
			else
			{
				var prof = data[i];
				var e = prof[k][ref_key];
				
				ranks[i] = { "slot" : i , "rank" : -1 , "val" : e };
			}
		}

		ranks.sort(function(a, b){return a.val-b.val});
		
		if( !all_equal )
		{
		
			for( var i = 0 ; i < ranks.length ; i++ )
			{
				ranks[i].rank = i;
			}
		
		}

		for( var i = 0 ; i < data.length ; i++ )
		{

			var prof = data[i];
			var re = prof[k][ref_key];
		
			var e = re;
			if( has_time )
				e = to_time(e);

	
			var my_slot = ranks.find( function(e){ return e.slot == i; } );
			
			if( my_slot == undefined )
			{
				tcontent += "<td>NA</td>";
			}
			else
			{
				var root = ranks[0];
				var delta = 0;
				
				if( has_time )
					delta = "&Delta;" + to_time(parseFloat(re) - parseFloat(root.val));
				else
					delta = "&Delta;" + (parseFloat(re) - parseFloat(root.val));
									

				if( all_equal )
				{
					tcontent += "<td>" + e + "</td>";
				}
				else if( my_slot.rank == 0 )
				{
					tcontent += "<td class='min'>#" + (my_slot.rank + 1) + "<br>" + e + "</td>";
					
				}
				else if( my_slot.rank == (ranks.length -1) )
				{
					tcontent += "<td  class='max'>#" + (my_slot.rank + 1) + "<br>" + e + "<br>" + delta + "</td>";
	
				}
				else
				{
					tcontent += "<td  class='mid'>#" + (my_slot.rank + 1) + "<br>" + e + "<br>" + delta + "</td>";
				}
				
				

			}
			
			
		}
	
	
		tcontent += "</tr>"
	}

	
	prt.append("<table class='sortable restable'>" + tcontent + "</table>");

}


function render_diff()
{
	$("#DIFF").empty();
	
	$("#DIFF").append("<h3>Total Time Difference</h3>");
	fill_diff_table( profile_dat , "time");
	
	$("#DIFF").append("<h3>Calls Difference</h3>");
	fill_diff_table( profile_dat , "hits");
}
