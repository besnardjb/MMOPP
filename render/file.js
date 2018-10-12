function do_render()
{
    update_loaded();
    profile_render();
    render_diff();
    walltime_render();
}



function update_loaded_mod(id)
{

    var i;

    for( i = 0 ; i < profile_dat.length ; i++ )
    {

        var v = $("#in_"+i).val();
        profile_dat[i].___name = v;

    }

    do_render();


}


function update_loaded()
{


    if( profile_dat.length == 0 )
    {
        return;
    }

    var ld = $("#LOADED");
    ld.empty();
    ld.append("<h3>Manage Profiles</h3>");
    var tcontent = "";

    tcontent += "<thead><tr><th>File</th><th>Name</th><th>Actions</th></tr></thead>";

    var i;


    for( i = 0 ; i < profile_dat.length ; i++ )
    {
        var pr = profile_dat[i];
        tcontent +=    "<tr>" +
            "<td>" + pr.___source + "</td>" +
            "<td><input id='in_" + i + "' value='" + pr.___name + "'></td>" +
            "<td>" +
            "<button  id='" + i + "' class='delete_loaded'>Delete</button>" +
            "</td>" +
            "</tr>";	
    }

    ld.append("<table class='restableb'>" + tcontent + "</table>");

    ld.append("<button class='update_loaded'>Save changes</button>");

    $(".update_loaded").on("click", update_loaded_mod );
}


$(document).ready( function()
        {
            /* ADD inputfile */
            var fileInput = $('#fin');

            fileInput.change( function() {
                var file = fileInput.get()[0].files[0];

                    var reader = new FileReader();

                    var fname = file.name;

                    reader.onload = function() {
                        var pr = "";

                        try
                        {
                            pr = JSON.parse(reader.result);
                        }
                        catch(e)
                        {
                            alert("Could not load file \n" + e);
                        }

                        var do_load = 1;

                        var i = 0;
                        for( i = 0 ; i < profile_dat.length ; i++ )
                        {
                            var tpr = profile_dat[i];
                            var src = tpr["___source"];

                            if( src == fname )
                            {
                                alert("Sorry, this profile is already loaded ("+ fname +")")
                                    do_load = 0;
                            }
                        }


                        if( do_load )
                        {
                            pr["___source"] = fname;
                            pr["___name"] = fname;
                            profile_dat.push(pr);

                            do_render();
                        }

                    };

                    reader.readAsText(file);    
            });

        });


