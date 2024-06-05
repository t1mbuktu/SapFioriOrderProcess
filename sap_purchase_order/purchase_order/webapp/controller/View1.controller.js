sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "../util/DateFormatter",
    "../util/PriceFormatter"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, DateFormatter, PriceFormatter) {
        "use strict";

        return Controller.extend("purchaseorder.controller.View1", {
            DateFormatter: DateFormatter,
            PriceFormatter: PriceFormatter,

            onInit: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();

                const that = this;

                oModel.read(`/A_PurchaseOrder`, {
                    urlParameters: {
                        "$expand": "to_PurchaseOrderItem,to_PurchaseOrderNote"
                    },
                    success: function(data, response) {
                        var jsonModel = new JSONModel(data.results);
                        console.log(jsonModel)
                        that.getOwnerComponent()
                            .getModel("purchaseOrders")
                            .setData(jsonModel);
                    },
                    error: function(oError) {
                        console.log(oError);
                    }
                });

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
                var purchaseOrderId = oEvent.getSource().getBindingContext("purchaseOrders").getObject().PurchaseOrder;                
                var oModelPurchaseOrder = this.getOwnerComponent().getModel()
                var that = this;
                oModelPurchaseOrder
                    .read(`/A_PurchaseOrder('${purchaseOrderId}')`, {
                        urlParameters: {
                            "$expand": "to_PurchaseOrderItem,to_PurchaseOrderNote"
                        },
                        success: function(data, response) {
                            var jsonModel = new JSONModel(data);
                            that.getOwnerComponent()
                                .getModel("selectedPurchaseOrder")
                                .setData(jsonModel);
                            that.setPurchaseOrderCounts(); 
                            
                            var purchaseOrderItems = data.to_PurchaseOrderItem.results;
                            var formattedPurchaseOrderItems = purchaseOrderItems.map(function(item) {
                                return {
                                    PurchaseOrderItemText: item.PurchaseOrderItemText,
                                    OrderQuantity: item.OrderQuantity,
                                    NetPriceAmount: item.NetPriceAmount
                                };
                            });

                            var formattedModel = new JSONModel(formattedPurchaseOrderItems);
                            that.getView().setModel(formattedModel, "formattedPurchaseOrderItems");
                            console.log(formattedPurchaseOrderItems);
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

            onPurchaseOrderItemPressed: function (oEvent){
                //ToDo
            }
        });
    });
