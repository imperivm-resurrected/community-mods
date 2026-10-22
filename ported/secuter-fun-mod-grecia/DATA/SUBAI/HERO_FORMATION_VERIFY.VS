//bool, ObjList objs, str OUT reasonText

str cmd_name;
int menu_type;

cmd_name = cmdwaiting;
if (cmd_name != "form-line-menu")
	if (cmd_name != "form-block-menu")
		if (cmd_name != "form-ranged-menu")
			if (cmd_name != "form-hilera-menu")
				if (cmd_name != "form-retaguardia-menu")
					if (cmd_name != "form-cavalry-menu")
						if (cmd_name != "form-front-menu")
							if(cmd_name != "form-cucaracha-menu")
								if(cmd_name != "form-alasdelinfierno-menu")
									return false;
reasonText = rollover(objs[0], true) + "\n" + FormDescription(cmdparam);
return true;
