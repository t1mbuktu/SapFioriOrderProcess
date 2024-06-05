sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "../util/Formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, Formatter) {
        "use strict";

        return Controller.extend("purchaseorder.controller.View1", {
            Formatter: Formatter,

            onInit: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();
                
                var sFirstPurchaseOrderPath = "/A_PurchaseOrder('4500000000')";

                this.getView().byId("purchaseOrderHeader").bindElement({
                    path: sFirstPurchaseOrderPath,
                    parameters: {
                        expand: "to_PurchaseOrderItem"
                    },
                    events: {
                        dataRequested: function () {
                        },
                        dataReceived: function (oData) {
                            if (!oData.getParameter("data")) {
                                MessageToast.show("Purchase Order not found.");
                            }
                        }
                    }
                });

                oView.setModel(oModel);

                var oViewModel = new JSONModel({
                    itemCount: 0
                });

                oView.setModel(oViewModel, "viewModel");

                this.setItemCount();
            },

            onSearch: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                console.log(sQuery);
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("PurchaseOrder", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }

                var oList = this.byId("OrdersList");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },

            onListItemPressed: function (oEvent) {
                var purchaseOrderId = oEvent.getSource().getBindingContext().getObject().PurchaseOrder;                
                var oModelPurchaseOrder = this.getOwnerComponent().getModel()
                var that = this;
                oModelPurchaseOrder
                    .read(`/A_PurchaseOrder('${purchaseOrderId}')`, {
                        urlParameters: {
                            "$expand": "to_PurchaseOrderItem,to_PurchaseOrderNote"
                        },
                        success: function(data, response) {
                            console.log(data)
                            var jsonModel = new JSONModel(data);
                            console.log(jsonModel);
                            that.getOwnerComponent()
                                .getModel("selectedPurchaseOrder")
                                .setData(jsonModel);
                            that.setPurchaseOrderCounts();    
                        },
                        error: function(oError) {
                            console.log(oError);
                        }
                    })

               
               
            },

            setItemCount: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();

                oModel.read("/A_PurchaseOrder", {
                    success: function (oData) {
                        var iLength = oData.results.length;
                        oView.getModel("viewModel").setProperty("/itemCount", iLength);
                    },
                    error: function () {
                    }
                });
            },

            setPurchaseOrderCounts: function () {
                var oModel = this.getOwnerComponent().getModel("selectedPurchaseOrder");
                var oView = this.getView();
                var PurchaseOrderItemsLength = oModel.oData.oData.to_PurchaseOrderItem.results.length;
                var PurchaseOrderNotesLength = oModel.oData.oData.to_PurchaseOrderNote.results.length;
                oView.getModel("viewModel").setProperty("/PurchaseOrderItemCount", PurchaseOrderItemsLength);
                oView.getModel("viewModel").setProperty("/PurchaseOrderNoteCount", PurchaseOrderNotesLength);

            },
        });
    });
