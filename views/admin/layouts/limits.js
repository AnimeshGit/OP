<%- include layouts/header.ejs %>
        <!-- BEGIN PAGE CONTENT -->
        <div class="page-content">
          <div class="header">
            <h2><strong>All</strong> Limits</h2>
            <div class="breadcrumb-wrapper">
              <ol class="breadcrumb">
                <li><a href="#">Limits</a>
                </li>
                <li class="active">View</li>
              </ol>
            </div>
          </div>
          <!--  -->
          <div class="row">
              <div class="col-md-6">
                  <a href="add_blogs">
                    <button type="button" class="btn btn-primary">Add New</button>
                  </a>
              </div>
          </div>
          <!--  -->
          <div class="row">
            <div class="col-lg-12">
              <%# if (error.length > 0) { %>
                <div class="alert media fade in alert-danger" id="message"><%# error %></div>
              <%# }else if (success.length > 0) { %>
                <div class="alert media fade in alert-success" id="message"><%# success %></div>
              <%# } %>
              <!-- HERE COMES YOUR CONTENT -->
              <div class="panel">
                <div class="panel-header">
                  <h3><i class="icon-bulb"></i> <strong> Blog </strong>  Listings</h3>
                </div>
                <div class="panel-content pagination2 table-responsive">
                  <table class="table dataTable" id="table2">
                    <thead>
                      <tr>
                        <th class="no_sort"></th>
                        <th class="sorting_asc">Sr No</th>
                        <th>blog title</th>
                        <th>blog image</th>
                        <th>blog author</th>
                        <th>action</th>
                      </tr>
                    </thead>
                    <tbody>
                       <%#
                        var j=0;
                        for(var i=0; i < data.length; i++) { 
                        j=j+1;
                      %>
                      <tr>
                        <td class="center "></td>
                        <td class=" sorting_1"><%# j %></td>
                        <td><%# data[i].title %></td>
                        <td>
                           <%# if(data[i].image==''){ %>
                        <img src="<%- globalConsTant.baseUrl + globalConsTant.imageUrl %>blogs/default.png" height="50" width="50">
                        <%# }else{ %>
                        <img src="<%- globalConsTant.baseUrl + globalConsTant.imageUrl %>blogs/<%- data[i].image %>" height="50" width="50">
                        <%#}%>
                      </td>
                        <td><%# data[i].authorName %></td>
                        <td>

                          <a data-rel="tooltip" data-placement="left" title data-original-title="Edit Blogs Data" class="btn btn-sm btn-default" href="edit_each_blog/<%#data[i]._id%>"><i class="icon-note"></i></a>
                          
                          <!-- <a data-rel="tooltip" data-placement="bottom" title data-original-title="View Blogs Data" class="btn btn-sm btn-primary" href="view_each_blog/<%#data[i]._id%>"><i class="fa fa-eye"></i></a> -->
                          
                          <!-- <a data-rel="tooltip" data-placement="right" title data-original-title="Remove Blogs Data" class="btn btn-sm btn-danger" data-toggle="modal" data-target="#modal-basic" id="<%-data[i]._id%>" onclick="passid(this.id,'<%# data[i].image %>');"><i class="icons-office-52"></i></a> -->


                          </td>
                      </tr>
                      <%#}%>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <%- include layouts/footer.ejs %>
        </div>
        <!-- END PAGE CONTENT -->
      </div>
      <!-- END MAIN CONTENT -->
      <!---Modal start -->
      <div class="modal fade" id="modal-basic" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
              <form action="delete_blog_data" method="post">
              <input type="hidden" name="setvalue" id="setvalue" value=""/>
              <input type="hidden" name="setvalueimage" id="setvalueimage" value=""/>
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="icons-office-52"></i></button>
                  <h4 class="modal-title"><strong>Delete</strong> Category</h4>
                </div>
                <div class="modal-body">
                  Are you sure you want to proceed?<br>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-default btn-embossed" data-dismiss="modal">Oops, I prefer not!</button>
                  <button type="submit" class="btn btn-primary btn-embossed" >Yes,I'm sure</button>
                </div>
                </form>
              </div>
            </div>
          </div>
<!--- Modal End -->
      <%- include layouts/js.ejs %>
  
  </body>
</html>

<script type="text/javascript">
function passid(id,image){
 document.getElementById('setvalue').value=id;
 document.getElementById('setvalueimage').value=image;
}

$('#message').delay(4000).fadeOut('slow');
</script>

