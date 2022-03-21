sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";
		var anioActual="";
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var anioBefore="";
		var arrayAnios=[];
		var usuario="";
		return Controller.extend("busqsemana.controller.Main", {
			onInit: function () {
				let oModel = this.getOwnerComponent()._getPropertiesToPropagate().oModels.undefined;
				//let oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel);
				oModel.setProperty("/searchEmbar",{});
				
				this._getCurrentUser();
				var date = new Date();
				this.anioActual=date.getFullYear();
				this.anioBefore=date.getFullYear()-1;
				var array=[];
				array.push({
					id: 1,
					anio:this.anioActual
				},
				{
					id:2,
					anio:this.anioBefore
				}); 
			
				this.getView().getModel("Anio").setProperty("/listaAnio",array);
				this.listarSemana();
				

			},
			_getCurrentUser: async function(){
					let oUshell = sap.ushell,
					oUser={};
					if(oUshell){
						let  oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");
						let sEmail = oUserInfo.getEmail().toUpperCase(),
						sName = sEmail.split("@")[0],
						sDominio= sEmail.split("@")[1];
						if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
							oUser = {
								name:sName
							}
						}else{
						oUser = {
						name: "FGARCIA"
						}
					}
						
					this.usuario=oUser.name;
					console.log(this.usuario);
			},
			changeAnio: function(){
				var anio=this.byId("idAnio").getValue();
				if(anio===this.anioActual.toString()){

					this.getView().getModel().setProperty("/listaSemana", "");
					this.getView().getModel().refresh(true);	
					this.getView().getModel().setProperty("/listaSemana",arrayAnios.listAñoActual);
				}else{
					this.getView().getModel().setProperty("/listaSemana", "");	
					this.getView().getModel().refresh(true);	

					this.getView().getModel().setProperty("/listaSemana",arrayAnios.listAñoAnterior);

				}
			},	
			listarSemana:function(anio){
				oGlobalBusyDialog.open();
				fetch(`${this.getHostService()}/api/tripulantes/ObtenerSemanas`, 
				{
					method: 'POST',
				})
				.then(resp => resp.json()).then(data => {
					console.log(data);    
					for(var i=0;i<data.listAñoActual.length;i++){
						data.listAñoActual[i].DIFER=this.zeroFill(data.listAñoActual[i].DIFER,2);
						data.listAñoAnterior[i].DIFER=this.zeroFill(data.listAñoAnterior[i].DIFER,2);
					}
					arrayAnios=data;
					this.getView().getModel().setProperty("/listaSemana",data.listAñoActual);
					
					oGlobalBusyDialog.close();
				}).catch(error => console.log(error)
				);
			 },
			 close:function(oModel){
				let idDialog = oModel.getProperty("/idDialogComp"),
				oControl = sap.ui.getCore().byId(idDialog);
				oControl.close();
			},
			 zeroFill: function( number, width )
			 {
					 width -= number.toString().length;
					 if ( width > 0 )
					 {
						 return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
					 }
					 return number + ""; // siempre devuelve tipo cadena
			 },
			 onSelectItem:function(oEvent){
				let oContext = oEvent.getSource().getBindingContext(),
				oModel = oContext.getModel(),
				help = oModel.getProperty("/help")||{};
				help.BEGDA = oContext.getProperty("BEGDA");
				help.ENDDA = oContext.getProperty("ENDDA");
				help.PABRP = oContext.getProperty("PABRP");
				console.log(help.PERNR);
				oModel.setProperty("/help",help);
				this.close(oModel);
			},
			agregarSemana: function(evt){
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.Semana.sPath.split("/")[2];
				console.log(indices);
			
				var fechaIni = this.getView().getModel().oData.listaSemana[indices].BEGDA;
				var fechaFin = this.getView().getModel().oData.listaSemana[indices].ENDDA;
				var semana = this.getView().getModel().oData.listaSemana[indices].PABRP;
	
				
				this.byId("idSemana").setValue(semana);
				this.byId("idFechaTrabajoIni").setValue(fechaIni);
				this.byId("idFechaTrabajoFin").setValue(fechaFin);
				
				this._onCloseDialogPersonal();
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
		});
	});
