sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller,BusyIndicator,Filter,FilterOperator) {
		"use strict";

		return Controller.extend("busqarmadores.controller.Main", {
			onInit: function () {
				let oModel = this.getOwnerComponent()._getPropertiesToPropagate().oModels.undefined;
				if(!oModel){   // para caso 
					oModel = this.getOwnerComponent()._getPropertiesToPropagate().oModels.DetalleMarea;
				}
				// let oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel);
				oModel.setProperty("/searchArma",{});
			},

			onPressSearching: function(){
				BusyIndicator.show(0);
				let oModel = this.getView().getModel(),
				oUser = oModel.getProperty("/user"),
				oFormData = oModel.getProperty("/form"),
				oService = {},
				aOptions = [],
				oOption = {};
				var idNroCliente= this.byId("idNroCliente").getValue();
				var idDescripcion= this.byId("idDescripcion").getValue();
				var idRuc= this.byId("idRuc").getValue();
				var idCantidad=this.byId("idCantidad").getValue();

				if(idNroCliente){
					aOptions.push(
						{
							cantidad: "10",
							control: "INPUT",
							key: "LIFNR",
							valueHigh: "",
							valueLow: idNroCliente
						}
					)
				}
				if(idDescripcion){
					aOptions.push(
						{
							cantidad: "10",
							control: "INPUT",
							key: "NAME1",
							valueHigh: "",
							valueLow: idDescripcion
						}
					)
				}
				if(idRuc){
					aOptions.push(
						{
							cantidad: "10",
							control: "INPUT",
							key: "STCD1",
							valueHigh: "",
							valueLow: idRuc
						}
					)
				}
				oService.PATH = this.getHostService() + "/api/General/Read_Table";
				oService.param = {
					delimitador: "|",
					fields : [],
					no_data : "",
					option : [],
					options : aOptions,
					order : "",
					p_user :"FGARCIA",
					rowcount : idCantidad,
					rowskips : 0,
					tabla : "LFA1"
				};
				this._getDataSearchHelp(oService);
	
				console.log(idNroCliente)

			},
			onCleanSearh:function(oEvent){
				let oContext = oEvent.getSource().getBindingContext(),
				oModelMaster = oContext.getModel();
				this.byId("idCantidad").setValue("200");
				oModelMaster.setProperty("/searchArma",{})
				this.getView().getModel().setProperty("/tempList",{});
				this.getView().getModel().refresh(true);
			},
			onSelectItem:function(oEvent){
				let oContext = oEvent.getParameter("rowContext"),
				oModel = oContext.getModel(),
				helpArma = oModel.getProperty("/helpArma")||{},
				oInput = oModel.getProperty("/input"),
				sId = oInput.getId();
				
				helpArma.LIFNR = oContext.getProperty("LIFNR");
				helpArma.NAME1 = oContext.getProperty("NAME1");
				helpArma.STCD1 = oContext.getProperty("STCD1");

				// Modelo con nombre
				oModel.setProperty("/Form/CDEMP",oContext.getProperty("LIFNR"));
				oModel.setProperty("/Form/NAME1",oContext.getProperty("NAME1"));
				oModel.setProperty("/Form/CDEMP",oContext.getProperty("LIFNR"));
				oModel.setProperty("/Form/NAME1",oContext.getProperty("NAME1"));
				// console.log(helpArma);
				oModel.setProperty("/helpArma",helpArma);
				if(sId.split("_")[1] === "R"){
					oInput.setValue(helpArma.LIFNR)
				}
				this.close(oModel);
			},
			
			close:function(oModel){
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
						console.log(oData.data.length);
						this.byId("idCantReg").setText("Cantidad de Registros: "+oData.data.length)
						oModel.setProperty("/tempList",aData);
					}
					BusyIndicator.hide();
				} catch (error) {
					sap.m.MessageBox.error("Se produjo un error de conexión");
				}
			},
			keyPress:function(oEvent){
				if(oEvent.mParameters.value!==""){
					this.onPressSearching();
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
			onSearch: function (oEvent) {
				// add filter for search
				var aFilters = [];
				var sQuery = oEvent.getSource().getValue();
				if (sQuery && sQuery.length > 0) {
					var filter = new Filter([
						new Filter("LIFNR", FilterOperator.Contains, sQuery),
						new Filter("NAME1", FilterOperator.Contains, sQuery),
						new Filter("STCD1", FilterOperator.Contains, sQuery)
					]);
					aFilters.push(filter);
				}
	
				// update list binding
				var oList = this.byId("table");
				var oBinding = oList.getBinding("rows");
				oBinding.filter(aFilters, "Application");
			}
			
		});
	});
