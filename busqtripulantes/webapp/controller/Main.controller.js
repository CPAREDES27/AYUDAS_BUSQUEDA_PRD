sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller,BusyIndicator) {
		"use strict";
		
		return Controller.extend("busqtripulantes.controller.Main", {
			onInit: function () {
				let oModel = this.getOwnerComponent()._getPropertiesToPropagate().oModels.undefined;
				//let oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel);
				oModel.setProperty("/searchEmbar",{});
			},
			
			onCleanSearh:function(oEvent){
				let oContext = oEvent.getSource().getBindingContext(),
				oModelMaster = oContext.getModel();
				oModelMaster.setProperty("/searchEmbar",{})
			},
			onSelectItem:function(oEvent){
				let oContext = oEvent.getParameter("listItem").getBindingContext(),
				
				oModel = oContext.getModel(),
				help = oModel.getProperty("/help")||{};
				
				help.PERNR = oContext.getProperty("PERNR");
				help.STELL = oContext.getProperty("STELL");
				help.VORNA = oContext.getProperty("VORNA");
				help.NACHN = oContext.getProperty("NACHN");
				help.NACH2 = oContext.getProperty("NACH2");
				console.log(help.PERNR);
				oModel.setProperty("/help",help);
				this.close(oModel);
			},
			close:function(oModel){
				let idDialog = oModel.getProperty("/idDialogComp"),
				oControl = sap.ui.getCore().byId(idDialog);
				oControl.close();
			},
			keyPress:function(oEvent){
				if(oEvent.mParameters.value!==""){
					this.onPressSearching();
				}
			},
			onPressSearching:function(){
				BusyIndicator.show(0);
				let oModel = this.getView().getModel(),
				oUser = oModel.getProperty("/user"),
				oFormData = oModel.getProperty("/form"),
				oService = {},
				aOptions = [],
				oOption = {};
				var idCantidad= this.byId("idCantidad").getValue();
				var idCodigo= this.byId("idCodigo").getValue();
				var idNombres= this.byId("idNombres").getValue();
				var idApellidoP= this.byId("idApellidoP").getValue();
				var idApellidoM= this.byId("idApellidoM").getValue();
				
				if(idCodigo){
					aOptions.push(
						{
							cantidad: "10",
							control: "INPUT",
							key: "PERNR",
							valueHigh: "",
							valueLow: idCodigo
						}
					)
				}
				if(idNombres){
					aOptions.push(
						{
							cantidad: "10",
							control: "INPUT",
							key: "VORNA",
							valueHigh: "",
							valueLow: idNombres
						}
					)
				}
				if(idApellidoP){
					aOptions.push(
						{
							cantidad: "10",
							control: "INPUT",
							key: "NACHN",
							valueHigh: "",
							valueLow: idApellidoP
						}
					)
				}
				if(idApellidoM){
					aOptions.push(
						{
							cantidad: "10",
							control: "INPUT",
							key: "NACH2",
							valueHigh: "",
							valueLow: idApellidoM
						}
					)
				}
				
				// CDPCN
				// DSPCN
				oService.PATH = this.getHostService() + "/api/General/Read_Table";
				oService.param = {
					delimitador: "|",
					fields : ["PERNR", "STELL", "VORNA", "NACHN", "NACH2"],
					no_data : "",
					option : [],
					options : aOptions,
					order : "",
					p_user : oUser.name,
					rowcount : idCantidad,
					rowskips : 0,
					tabla : "ZHRP_BD_PERSONAL"
				};
	
				this._getDataSearchHelp(oService);
	
			},
			_getDataSearchHelp: async function(oService){
				let oModel = this.getView().getModel();
				try {
					let oGetTemp= await fetch(oService.PATH,{
						method:'POST',
						body:JSON.stringify(oService.param)
					});
					if(oGetTemp.status===200){
						let oData = await oGetTemp.json(),
						aData = oData["data"];
						oModel.setProperty("/tempList",aData);
					}
					BusyIndicator.hide();
				} catch (error) {
					sap.m.MessageBox.error("Se produjo un error de conexión");
				}
			},

			/**
			 * 
			 * @returns url service 
			 */
			 getHostService: function () {
				var urlIntance = window.location.origin,
				servicioNode ; 
	
				if (urlIntance.indexOf('tasaqas') !== -1) {
					servicioNode = 'qas'; // aputando a QAS
				} else if (urlIntance.indexOf('tasaprd') !== -1) {
					servicioNode = 'prd'; // apuntando a PRD
				}else if(urlIntance.indexOf('localhost') !== -1){
					servicioNode = 'cheerful-bat-js'; // apuntando a DEV
				}else{
					servicioNode = 'cheerful-bat-js'; // apuntando a DEV
				}
	
				return `https://cf-nodejs-${servicioNode}.cfapps.us10.hana.ondemand.com`;
			},
		});
	});
