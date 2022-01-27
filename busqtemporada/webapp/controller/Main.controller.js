sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller,
	BusyIndicator) {
		"use strict";

		return Controller.extend("busqtemporada.controller.Main", {
			onInit: function () {
				let oModel = this.getOwnerComponent()._getPropertiesToPropagate().oModels.undefined;
				//let oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel);
				oModel.setProperty("/form",{});
			},

			/**
			 * Selecciona un item de la tabla
			 * @param {event} oEvent 
			 */
			onSelectItem:function(oEvent){
				let oContext = oEvent.getSource().getBindingContext(),
				oModel = oContext.getModel(),
				help = oModel.getProperty("/help")||{};
				help.CDPCN = oContext.getProperty("CDPCN");
				help.DSPCN = oContext.getProperty("DSPCN");
				help.FHITM = oContext.getProperty("FHITM");
				help.FHFTM = oContext.getProperty("FHFTM");
				help.ZCDZAR = oContext.getProperty("ZCDZAR");
				help.ZDSZAR = oContext.getProperty("ZDSZAR");

				oModel.setProperty("/help",help);
				this.onClose(oModel);
			},
			keyPress:function(oEvent){
				if(oEvent.mParameters.value!==""){
					this.onPressSearching();
				}
			},
			/**
			 * Evento del boton buscar temporada
			 */
			onPressSearching:function(){
				BusyIndicator.show(0);
				let oModel = this.getView().getModel(),
				oUser = oModel.getProperty("/user"),
				oFormData = oModel.getProperty("/form"),
				oService = {},
				aOptions = [],
				oOption = {},
				aSearchFields = ["CDPCN","DSPCN","ESPCN"];

				aSearchFields.forEach(oField=>{
					oOption = {};
					oOption.cantidad = "";
					oOption.control = oField === "ESPCN" ? "MULTIINPUT" : "INPUT";
					oOption.key = oField;
					oOption.valueHigh = "";
					oOption.valueLow = oField === "ESPCN" ? "S" : oFormData[oField];
					if(oOption.valueLow) aOptions.push(oOption);
				});

				// CDPCN
				// DSPCN
				oService.PATH = this.getHostService() + "/api/General/Read_Table";
				oService.param = {
					delimitador: "|",
					fields : ["CDPCN", "DSPCN", "FHITM", "FHFTM", "CTNAC", "ZCDZAR", "ZDSZAR"],
					no_data : "",
					option : [],
					options : aOptions,
					order : "CDPCN DESCENDING",
					p_user : oUser.name,
					rowcount : 0,
					rowskips : 0,
					tabla : "ZV_FLTZ"
				};

				this._getDataSearchHelp(oService);

			},

			/**
			 * Evento del boton limpiar
			 * @param {*} oEvent 
			 */
			onCleanSearh:function(oEvent){
				let oContext = oEvent.getSource().getBindingContext(),
				oModelMaster = oContext.getModel();
				oModelMaster.setProperty("/form",{});
			},
			
			/**
			 * Evento que se activa cuando se activa la tabla
			 * @param {*} oEvent 
			 */
			onUpdateTable:function(oEvent){
				// update the worklist's object counter after the table update
				var sTitle,
				oTable = oEvent.getSource(),
				oModel = this.getView().getModel(),
				iTotalItems = oEvent.getParameter("total"),
				oModelResource = this.getOwnerComponent().getModel("i18n");
				// only update the counter if the length is final and
				// the table is not empty
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = oModelResource.getResourceBundle().getText("titleTableCount", [iTotalItems]);
				} else {
					sTitle = oModelResource.getResourceBundle().getText("titleTable");
				}
				oModel.setProperty("/tableTitle", sTitle);
			},

			onClose:function(oModel){
				let idDialog = oModel.getProperty("/idDialogComp"),
				oControl = sap.ui.getCore().byId(idDialog);
				oControl.close();
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
