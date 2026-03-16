var record_edit=null;
var source_edit=null;

function onRecordDelete(path,rid)
{
	if(path=="neobjects")
		show_confirmation_box("Delete record","You are about to delete the record of a <b>physical object</b>. The record of the corresponding electronic object will not be deleted. Do you want to proceed?","","JS");
	else show_confirmation_box("Delete record","You are about to delete the record of an <b>electronic object</b>. The digitized object will not be accessible in the database any more. Do you want to proceed?","","JS");
	return false;
}

function onAddResource(entries_index)
{
	var info="";
		info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To add a new reference to a bibliographic or web source you need first to choose the type of source and then give the details of the source by filling a form.</font></div>";
		
		var tc = document.getElementById('textarea_container2b');
		tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Adding a new source - Step 1 of 2</font></div><div class=\"textarea_block\"><font class=\"nrml\">You are adding a source to the field <b>"+record_edit.entries[entries_index].field.name+"</b>.<br><br><b>Select type of source:</b></font><br><font class=\"chkbx\">"
		+"<input type=\"radio\" name=\"source_type\" value=\"url\" checked=\"checked\">URL (web source)<br><input type=\"radio\" name=\"source_type\" value=\"bib\">Bibliographic source"+
		"</font></div><div class=\"textarea_block\"><input type=\"button\" value=\"Select\" onclick=\"onAddResource2("+entries_index+");\"><input type=\"button\" value=\"Cancel\" onclick=\"showDefaultEdit();\"></div>"+
		"<div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
		
		return false;
}

function onAddResource2(entries_index)
{
	var radiobuttons=document.getElementsByName('source_type');
	for (var i = 0; i < radiobuttons.length; i++) {
		if (radiobuttons[i].checked) {
			if(radiobuttons[i].value=="url")
			{
				onAddResourceURL(entries_index);
			}
			else
			{
				onAddResourceBib(entries_index);
			}
        break;
		}
	}
}

function onAddResourceURL(entries_index)
{
	var info="";
		info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To add a new reference to a bibliographic or web source you need first to choose the type of source and then give the details of the source by filling a form.</font></div>";
		
		var tc = document.getElementById('textarea_container2b');
		source_edit=new DEAsource();
		tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Adding a new source - Step 2 of 2</font></div><div class=\"textarea_block\"><font class=\"nrml\">You are adding a source to the field <b>"+record_edit.entries[entries_index].field.name+"</b>.<br><br><b>Type of source:</b> URL (web source)</font><br><br>"+source_edit.sprintEdit()+
		"</div><div class=\"textarea_block\"><input type=\"button\" value=\"Add source\" onclick=\"onAddResourceURL2("+entries_index+");\"><input type=\"button\" value=\"Cancel\" onclick=\"onAddResource("+entries_index+");\"></div>"+
		"<div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
}

function onAddResourceURL2(entries_index)
{
	source_edit.updateAfterEdit();
	record_edit.entries[entries_index].addSource(source_edit);
	var ef=document.getElementById('edit_form');
	ef.innerHTML=dea_view.sprint();
	
	showDefaultEdit();
	setEditResult("A new URL resource was successfully added!");
}

function onAddResourceBib(entries_index)
{
	var info="";
		info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To add a new reference to a bibliographic or web source you need first to choose the type of source and then give the details of the source by filling a form.</font></div>";
		
		var tc = document.getElementById('textarea_container2b');
		
		source_edit=new DEAsource();
		source_edit.citation_id="newbib"+random_string(10);
		source_edit.citation=new DEArecord('citations',source_edit.citation_id);
		source_edit.setNewFile(true);
		
		tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Adding a new source - Step 2 of 2</font></div><div class=\"textarea_block\"><font class=\"nrml\">You are adding a source to the field <b>"+record_edit.entries[entries_index].field.name+"</b>.<br><br><b>Type of source:</b> Bibliographic source<br></font><br>"+source_edit.sprintEdit()+
		"<br></div><div class=\"textarea_block\"><input type=\"button\" value=\"Add source\" onclick=\"onAddResourceBib2("+entries_index+");\"><input type=\"button\" value=\"Cancel\" onclick=\"onAddResource("+entries_index+");\"></div>"+
		"<div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
}

function onAddResourceBib2(entries_index)
{
	source_edit.updateAfterEdit();
	
	record_edit.entries[entries_index].addSource(source_edit);
	var ef=document.getElementById('edit_form');
	ef.innerHTML=dea_view.sprint();
	
	showDefaultEdit();
	setEditResult("A new bibliographic resource was successfully added!");
}

function onDeleteResourceYes(entries_index,sources_index)
{
	record_edit.entries[entries_index].sources.splice(sources_index,1);
	var ef=document.getElementById('edit_form');
	ef.innerHTML=dea_view.sprint();
	close_dialog_box();
	setEditResult("Resource was successfully deleted!");
}

function onDeleteResource(entries_index,sources_index)
{
	show_confirmation_box("Delete source","Do you want to delete from the field <b>"+record_edit.entries[entries_index].field.name+"</b> the following source? <br><br>"+record_edit.entries[entries_index].sources[sources_index].sprint(0),"onDeleteResourceYes("+entries_index+","+sources_index+");","JS");
	return false;
}

function onAddBibInfo()
{
	show_information_box("Information","To add bibliographical resources on a particular field click on the <b>Add source</b> button located below that field.");
}

function onAddUrlInfo()
{
	show_information_box("Information","To add electronic resources on a particular field click on the <b>Add source</b> button located below that field.");
}

function onSaveRecord()
{
	var ef=document.getElementById('edit_form');
	ef.submit();
}

function showInitialEdit()
{
	var tc = document.getElementById('textarea_container2');
	tc.innerHTML="<div id=\"textarea_container2b\" style=\"background:rgba(255,255,179,0.95);padding-top:1px;min-height:300px;\"></div>";
	
	var info="";
	info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To edit a record click on the <b>Edit</b> button on the title of the record.</font></div>";
		
	info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To delete a record click on the <b>Delete</b> button on the title of the record.</font></div>";
	
	info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To edit a bibliographic or electronic source click on the <b>Edit</b> button on the title of the <b>Sources</b> section.</font></div>";
		
	var tc = document.getElementById('textarea_container2b');
	
	tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Available actions</font></div>"+
		"<div class=\"textarea_block\"><input type=\"button\" value=\"Close editor\" onclick=\"window.close();\"></div>"+
		"<div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
}

function showDefaultEdit()
{
	var info="";
	if(record_edit.path=="neobjects") info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">You are now editing the record of a <b>physical object</b>. This record should contain the physical description and other information related to the real world object.</font></div>";
	else info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">You are now editing the record of a <b>digital object</b>. This record should contain the description of the digital file, such as resolution, and other information related to the digitization process.</font></div>";
		
	info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To delete a field, just erase its contents. All blank fields will be automatically removed from the record.</font></div>";
		
	var tc = document.getElementById('textarea_container2b');
	
	tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Available actions</font></div><div class=\"textarea_block\"><input type=\"button\" value=\"Add a new field\" onclick=\"onAddField1();\"></div><div class=\"textarea_block\"><input type=\"button\" value=\"Add a bibliographical reference\" onclick=\"onAddBibInfo();\"></div><div class=\"textarea_block\"><input type=\"button\" value=\"Add an electronic resource\" onclick=\"onAddUrlInfo();\"></div><div class=\"textarea_block\"><input type=\"button\" value=\"Save changes\" onclick=\"onSaveRecord();\"></div>"+
		"<div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
	
}

function onEditResource(e)
{
	source_edit=null;
	
	var offset=parseInt(e.offsetParent.offsetParent.offsetTop);

	var tc = document.getElementById('textarea_container1');
	dea_view.setMode(DEA_STATIC);
	dea_view.editResources(true);
	tc.innerHTML="<form action=\"\" method=\"post\" name=\"form1\" id=\"edit_form\" onsubmit=\"return onDoneResource();\">"+dea_view.sprint()+"</form>";
		
	
	var tc = document.getElementById('textarea_container2');
	tc.innerHTML="<div style=\"height:"+offset+"px\";></div><div id=\"textarea_container2b\" style=\"background:rgba(255,255,179,0.95);padding-top:1px;min-height:300px;\"></div>";
		
	
	var info="";
	info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To edit a bibliographic or electronic source select the source and then edit the corresponding form.</font></div>";
		
	var tc = document.getElementById('textarea_container2b');
		
	tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Available actions</font></div><div class=\"textarea_block\"><input type=\"button\" value=\"Cancel\" onclick=\"onDoneResource();\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
	
	return false;
}

function onResourceChange()
{	
	if(source_edit!=null)
	{
		source_edit.updateAfterEdit();
		var radios = document.getElementsByName('source_radio');
		for (var i = 0, length = radios.length; i < length; i++) {
			var tc= document.getElementById('source_'+i);
			tc.innerHTML=dea_view.printed_sources[i].sprint(i+1);
			}
	}

	var info="";
	info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To edit a bibliographic or electronic source select the source and then edit the corresponding form.</font></div>";
		
	info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To add new bibliographical  or electronic resources to a particular field, start editing the corresponding field and then click on the <b>Add source</b> button located below that field.</font></div>";
	
	info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To delete bibliographical or electronic resources from a particular field, start editing the corresponding field and then click on the <b>x</b> button located below that field.</font></div>";
		
	var tc = document.getElementById('textarea_container2b');
	
	var radios = document.getElementsByName('source_radio');
	var source_id=0;
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked) {
		source_id=parseInt(radios[i].value);
        break;
		}
	}
	source_edit=dea_view.printed_sources[source_id];
	
	tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Editing Sources</font></div><div class=\"textarea_block\">"+dea_view.printed_sources[source_id].sprintEdit()+"</div>"+
		"<div class=\"textarea_block\"><input type=\"button\" value=\"Save changes\" onclick=\"onDoneResource();\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
	
}

function onDoneResource()
{
	if(source_edit!=null)
	{
		source_edit.updateAfterEdit();
		var radios = document.getElementsByName('source_radio');
		for (var i = 0, length = radios.length; i < length; i++) {
			var tc= document.getElementById('source_'+i);
			tc.innerHTML=dea_view.printed_sources[i].sprint(i+1);
			}
	}
	
	var ef=document.getElementById('edit_form');
	ef.submit();
	return false;
}

function onRecordEdit(path,rid,e)
{
    var record=dea_view.findRecord(path,rid);
	if(record!=null)
	{
		record_edit=record;
		var offset=parseInt(e.offsetParent.offsetParent.offsetTop);

		var tc = document.getElementById('textarea_container1');
		dea_view.setMode(DEA_STATIC);
		record.setMode(DEA_EDIT);
		tc.innerHTML="<form action=\"\" method=\"post\" name=\"form1\" id=\"edit_form\">"+dea_view.sprint()+"</form>";
		
		
		var tc = document.getElementById('textarea_container2');
		tc.innerHTML="<div style=\"height:"+offset+"px\";></div><div id=\"textarea_container2b\" style=\"background:rgba(255,255,179,0.95);padding-top:1px;min-height:300px;\"></div>";
		
		showDefaultEdit();
		
	}	
	return false;
}


function show_confirmation_box(title,text,variables,method)
{
   var dc = document.getElementById('dialog_container');

   var newdiv = document.createElement('div');
   
   var out="<div style=\"width:100%;height:100%;background:rgba(0,0,0,0.8);position:fixed;top:0px;overflow:hidden;\"><center><table height=\"100%\"><tr><td valign=\"middle\"><div class=\"textarea_space\" style=\"min-height:150px;min-width:400px;max-width:400px;background:rgba(255,255,255,0.8);padding-top:1px;\"><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"ttl\">"+title+"</font></div><div class=\"textarea_block\"><font class=\"nrml\">"+text+"</font></div><div class=\"textarea_block\" style=\"position:absolute;bottom:0px;right:0px\"><div style=\"position:relative;float:right;\"><input type=\"button\" value=\"Cancel\" onclick=\"close_dialog_box();\"></a></div><div style=\"position:relative;float:right;\">";
   
   if(method=="JS") out+="<input type=\"submit\" value=\"Yes\" onclick=\""+variables+"\">";
   else out+="<form action=\"\" method=\"post\" name=\"form1\"><input type=\"submit\" value=\"Yes\">"+variables+"</form>";
   
   out+="</div></div></div></td></tr></table></center></div>";
   newdiv.innerHTML=out;
  dc.appendChild(newdiv);
}

function show_error_box(title,text)
{
   var dc = document.getElementById('dialog_container');

   var newdiv = document.createElement('div');
   newdiv.innerHTML="<div style=\"width:100%;height:100%;background:rgba(0,0,0,0.8);position:fixed;top:0px;overflow:hidden;\"><center><table height=\"100%\"><tr><td valign=\"middle\"><div class=\"textarea_space\" style=\"min-height:150px;min-width:400px;max-width:400px;background:rgba(255,255,255,0.8);padding-top:1px;\"><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><img src=\"warning_icon.png\" align=\"top\" height=\"12px\"><font class=\"ttl\">"+title+"</font></div><div class=\"textarea_block\"><font class=\"nrml\">"+text+"</font></div><div class=\"textarea_block\" style=\"position:absolute;bottom:0px;right:0px\"><div style=\"position:relative;float:right;\"><input type=\"button\" value=\"OK\" onclick=\"close_dialog_box();\"></a></div><div style=\"position:relative;float:right;\"></div></div></div></td></tr></table></center></div>";
  dc.appendChild(newdiv);
}

function show_information_box(title,text)
{
   var dc = document.getElementById('dialog_container');

   var newdiv = document.createElement('div');
   newdiv.innerHTML="<div style=\"width:100%;height:100%;background:rgba(0,0,0,0.8);position:fixed;top:0px;overflow:hidden;\"><center><table height=\"100%\"><tr><td valign=\"middle\"><div class=\"textarea_space\" style=\"min-height:150px;min-width:400px;max-width:400px;background:rgba(255,255,255,0.8);padding-top:1px;\"><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"ttl\">"+title+"</font></div><div class=\"textarea_block\"><font class=\"nrml\">"+text+"</font></div><div class=\"textarea_block\" style=\"position:absolute;bottom:0px;right:0px\"><div style=\"position:relative;float:right;\"><input type=\"button\" value=\"OK\" onclick=\"close_dialog_box();\"></a></div><div style=\"position:relative;float:right;\"></div></div></div></td></tr></table></center></div>";
  dc.appendChild(newdiv);
}

function close_dialog_box()
{
   var dc = document.getElementById('dialog_container');
   dc.innerHTML="";
}

function setEditResult(text)
{
	var dc = document.getElementById('edit_result');
	dc.innerHTML="<div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Action result</font></div><div class=\"textarea_block\"><font class=\"nrml\">"+text+"</font></div>";
}

function onGroupSelect()
{
  var eg=document.getElementById('group_selector');
  var group_id=eg.options[eg.selectedIndex].value;
  var ef=document.getElementById('field_selector');
  var s="";
  for(var i=0;i<dea_fields.length;i++)
	if(dea_fields[i].group.id==group_id)s=s+"<option value=\""+dea_fields[i].id+"\">"+dea_fields[i].name+"</option>";
  ef.innerHTML=s;

}

function group_combo_box()
{
   var out="";
   out+="<select id=\"group_selector\" onchange=\"onGroupSelect();\">";
   for(var i=0;i<dea_groups.length;i++)
	out+="<option value=\""+dea_groups[i].id+"\">"+dea_groups[i].name+"</option>";
   out+="</select>";
   return out;
}

function onAddField1()
{
	var info="";
		
		info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To add a new field you need first to choose a specific category of fields and then select one or more fields from this category.</font></div>";
		
		info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To delete a field, just erase its contents. All blank fields will be automatically removed from the record.</font></div>";
		
		var tc = document.getElementById('textarea_container2b');
		tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Adding field - Step 1 of 2</font></div><div class=\"textarea_block\"><font class=\"nrml\"><b>Select category:</b></font>"
		+group_combo_box()+
		"</div><div class=\"textarea_block\"><input type=\"button\" value=\"Select\" onclick=\"onAddField2();\"><input type=\"button\" value=\"Cancel\" onclick=\"showDefaultEdit();\"></div>"+
		"<div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
}

function onAddField2()
{
	
   var es=document.getElementById('group_selector');
   var group_id=parseInt(es.options[es.selectedIndex].value);
   var group_name=es.options[es.selectedIndex].text;

	var info="";
		
		info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To add a new field you need first to choose a specific category of fields and then select one or more fields from this category.</font></div>";
		
		info+="<div class=\"textarea_block\"><img src=\"question_icon.png\" align=\"top\" height=\"12px\"><font class=\"nrml\">To delete a field, just erase its contents. All blank fields will be automatically removed from the record.</font></div>";
		
		var tc = document.getElementById('textarea_container2b');
		tc.innerHTML="<div id=\"edit_result\"></div><div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Adding field - Step 2 of 2</font></div><div class=\"textarea_block\"><font class=\"nrml\"><b>Selected category:</b> "+group_name+"<br><br><b>Please select one or more fields:</b></font><br><font class=\"chkbx\">"
		+field_combo_box(group_id)+
		"</font></div><div class=\"textarea_block\"><input type=\"button\" value=\"Add the selected fields\" onclick=\"onAddField3();\"> <input type=\"button\" value=\"Change category\" onclick=\"onAddField1();\"></div>"+
		"<div class=\"textarea_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"ttl\">Useful information</font></div>"+info;
}

function onAddField3()
{
   var checkboxes=document.getElementsByName('field_selector');
   var field_ids=[];
   for (var i=0; i<checkboxes.length; i++) {
		if (checkboxes[i].checked) {
			field_ids.push(checkboxes[i].value);
		}
   }
   showDefaultEdit();
   
   if(field_ids.length==0)
   {
		setEditResult("<img src=\"warning_icon.png\" align=\"top\" height=\"12px\"><b>Error:</b> No fields were selected.");
   }
   else
   {
   
   var ef=document.getElementById('edit_form');
   var counter=0;
   for(var i=0;i<field_ids.length;i++)
   {
   var new_entry=new DEAentry();
   new_entry.field_id=field_ids[i];
   
   if(new_entry.findField())
   {
	   var num_of_entries=record_edit.entries.length;
	   record_edit.addEntry(new_entry);
	   if(num_of_entries+1==record_edit.entries.length) 
	   {
		 counter+=1;
	   }
    }
	}
	 if(counter==1) setEditResult("<b>"+counter+"</b> new field was successfully added!");
	 else setEditResult("<b>"+counter+"</b> new fields were successfully added!");
     ef.innerHTML=dea_view.sprint();
	}
}

function field_combo_box(group_id)
{
   var out="";
   var counter=0;
   //out+="<select id=\"field_selector\" onchange=\"\">";
   for(var i=0;i<dea_fields.length;i++)
	if(dea_fields[i].group.id==group_id && record_edit.containsField(dea_fields[i].id)==false)//out+="<option value=\""+dea_fields[i].id+"\">"+dea_fields[i].name+"</option>";
	{out+="<input type=\"checkbox\" name=\"field_selector\" value=\""+dea_fields[i].id+"\">"+dea_fields[i].name+"<br>";counter+=1;}
   //out+="</select>";
   if(counter==0) out+="There are no additional fields in this category.";
   return out;
}

function random_string(id_size)
{
    var out = "";
    var alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0;i<id_size;i++)
        out += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
    return out;
}