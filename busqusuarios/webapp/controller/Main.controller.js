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

        return Controller.extend("busqusuarios.controller.Main", {
            onInit: function () {
                let oModel = this.getOwnerComponent()._getPropertiesToPropagate().oModels.undefined;
				//let oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel);
				oModel.setProperty("/searchUsers",{});
            },
            onCleanSearh:function(oEvent){
				let oContext = oEvent.getSource().getBindingContext(),
				oModelMaster = oContext.getModel();
				oModelMaster.setProperty("/searchUsers",{})
			},
            onSelectItem:function(oEvent){
				let oContext = oEvent.getParameter("rowContext"),
				
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
				if(oEvent.mParameters.value.trim()!==""){
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
				
                aOptions.push({
                    cantidad: "10",
                    control: "COMBOBOX",
                    key: "ABKRS",
                    valueHigh: "",
                    valueLow: "TT",
                  })

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
					p_user : "FGARCIA",
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
                        console.log(oData);
						this.byId("idCantReg").setText("Lista de registros: " + aData.length);
						oModel.setProperty("/tempList",aData);1
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
				let urlIntance = window.location.origin,
				servicioNode ; 

				if (urlIntance.indexOf('tasacalidad') !== -1) {
					servicioNode = 'qas'; // aputando a QAS
				} else if (urlIntance.indexOf('tasaproduccion') !== -1) {
					servicioNode = 'prd'; // apuntando a PRD
				}else if(urlIntance.indexOf('localhost') !== -1){
					// servicioNode = 'cheerful-bat-js'; // apuntando a DEV
					servicioNode = 'qas'; // aputando a QAS
				}else{
					// servicioNode = 'cheerful-bat-js'; // apuntando a DEV
					servicioNode = 'qas'; // aputando a QAS
				}

				return `https://node-flota-${servicioNode}.cfapps.us10.hana.ondemand.com`;
			},
			onSearch: function (oEvent) {
				// add filter for search
				var aFilters = [];
				var sQuery = oEvent.getSource().getValue();
				if (sQuery && sQuery.length > 0) {
					var filter = new Filter([
						new Filter("PERNR", FilterOperator.Contains, sQuery),
						new Filter("VORNA", FilterOperator.Contains, sQuery),
						new Filter("NACHN", FilterOperator.Contains, sQuery),
						new Filter("NACH2", FilterOperator.Contains, sQuery),
						new Filter("STELL", FilterOperator.Contains, sQuery)
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
